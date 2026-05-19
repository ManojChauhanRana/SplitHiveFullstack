class Users::SessionsController < Devise::SessionsController
  respond_to :json

  private

  def respond_with(resource, _opts = {})
    invite_result = accept_group_invitation(resource)

    render json: {
      status: { code: 200, message: 'Logged in successfully.' },
      data: resource,
      joined_group_id: invite_result&.group&.id
    }, status: :ok
  end

  def accept_group_invitation(resource)
    return if invite_token.blank?

    result = GroupInvitationAcceptor.accept(invite_token, user: resource)
    result.joined? ? result : nil
  end

  def invite_token
    params.dig(:user, :invite_token)
  end

  def respond_to_on_destroy(*_)
    if request.headers['Authorization'].present?
      begin
        jwt_payload = JWT.decode(request.headers['Authorization'].split(' ').last, Rails.application.credentials.fetch(:secret_key_base)).first
        current_user = User.find(jwt_payload['sub'])
      rescue JWT::DecodeError, ActiveRecord::RecordNotFound
        current_user = nil
      end
    end
    
    if current_user
      render json: {
        status: 200,
        message: 'Logged out successfully.'
      }, status: :ok
    else
      render json: {
        status: 401,
        message: "Couldn't find an active session."
      }, status: :unauthorized
    end
  end
end
