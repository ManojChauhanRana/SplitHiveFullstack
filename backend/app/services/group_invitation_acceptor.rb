class GroupInvitationAcceptor
  PURPOSE = :group_invitation

  Result = Struct.new(:status, :group, :email, :message, keyword_init: true) do
    def joined?
      status == :joined
    end
  end

  def self.token_for(invite)
    verifier.generate(
      {
        group_id: invite.group_id,
        email: invite.email,
        invited_by_id: invite.invited_by_id
      },
      expires_in: 14.days
    )
  end

  def self.accept(token, user: nil)
    return Result.new(status: :invalid, message: "Invitation link is missing a token.") if token.blank?

    payload = verifier.verify(token)
    email = payload_value(payload, :email).to_s.downcase
    group = Group.find(payload_value(payload, :group_id))
    invited_user = user || User.find_by("LOWER(email) = ?", email)

    return Result.new(status: :registration_required, group: group, email: email) unless invited_user

    unless invited_user.email.to_s.downcase == email
      return Result.new(status: :email_mismatch, group: group, email: email, message: "This invitation was sent to #{email}.")
    end

    invite = group.group_invites.find_by("LOWER(email) = ?", email)
    creator = invite&.inviter || User.find_by(id: payload_value(payload, :invited_by_id))

    group.group_members.find_or_create_by!(user: invited_user) do |member|
      member.creator = creator
    end

    Result.new(status: :joined, group: group, email: email)
  rescue ActiveSupport::MessageVerifier::InvalidSignature, ActiveSupport::MessageEncryptor::InvalidMessage
    Result.new(status: :invalid, message: "Invitation link is invalid or has expired.")
  rescue ActiveRecord::RecordNotFound
    Result.new(status: :invalid, message: "The invited group could not be found.")
  end

  def self.verifier
    Rails.application.message_verifier(PURPOSE)
  end

  def self.payload_value(payload, key)
    payload[key.to_s] || payload[key]
  end
end
