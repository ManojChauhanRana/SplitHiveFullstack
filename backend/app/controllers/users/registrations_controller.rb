class Users::RegistrationsController < Devise::RegistrationsController
  respond_to :json

  private

  def respond_with(resource, _opts = {})
    if request.post?
      if resource.persisted?
        invite_result = accept_group_invitation(resource)
        if resource.active_for_authentication?
          render json: {
            status: { code: 200, message: 'Signed up successfully.' },
            data: resource,
            joined_group_id: invite_result&.group&.id
          }
        else
          render json: {
            status: { code: 200, message: "A confirmation email has been sent to #{resource.email}." },
            data: resource,
            joined_group_id: invite_result&.group&.id,
            confirmation_required: true
          }
        end
      else
        render json: {
          status: { message: "User couldn't be created successfully. #{resource.errors.full_messages.to_sentence}" }
        }, status: :unprocessable_entity
      end
    elsif request.put? || request.patch?
      if resource.errors.empty?
        render json: {
          status: { code: 200, message: 'Profile updated successfully.' },
          data: resource
        }
      else
        render json: {
          status: { message: "Profile couldn't be updated. #{resource.errors.full_messages.to_sentence}" }
        }, status: :unprocessable_entity
      end
    end
  end

  def accept_group_invitation(resource)
    return if invite_token.blank?

    result = GroupInvitationAcceptor.accept(invite_token, user: resource)
    result.joined? ? result : nil
  end

  def invite_token
    params.dig(:user, :invite_token)
  end
end
