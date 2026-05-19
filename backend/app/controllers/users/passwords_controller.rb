class Users::PasswordsController < Devise::PasswordsController
  respond_to :json

  private

  def respond_with(resource, _opts = {})
    if resource.is_a?(Hash) || resource.errors.empty?
      render json: { status: { code: 200, message: "Password reset instructions sent." } }
    else
      render json: { status: { message: "Failed: #{resource.errors.full_messages.to_sentence}" } }, status: :unprocessable_entity
    end
  end
end
