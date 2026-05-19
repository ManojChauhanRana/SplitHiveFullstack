class GroupMailer < ApplicationMailer
  default from: ENV.fetch("EMAIL", "hello@splithive.com")

  def invitation_email(invite)
    @invite = invite
    @group = invite.group
    @inviter = invite.inviter
    
    @frontend_url = ENV.fetch('FRONTEND_URL', 'http://localhost:5173')
    @token = GroupInvitationAcceptor.token_for(invite)
    @url = "#{@frontend_url}/accept-invite?token=#{CGI.escape(@token)}"
    
    mail(
      to: @invite.email, 
      subject: "You have been invited to join #{@group.name} on SplitHive"
    )
  end

  def platform_invitation_email(email, inviter)
    @invite_email = email
    @inviter = inviter
    @frontend_url = ENV.fetch('FRONTEND_URL', 'http://localhost:5173')
    @url = "#{@frontend_url}/register?email=#{CGI.escape(email)}&invitation=platform"

    mail(
      to: email,
      subject: "You have been invited to SplitHive"
    )
  end
end
