class Users::ConfirmationsController < Devise::ConfirmationsController
  def show
    self.resource = resource_class.confirm_by_token(params[:confirmation_token])
    yield resource if block_given?

    frontend_url = ENV.fetch('FRONTEND_URL', 'http://localhost:5173')

    if resource.errors.empty?
      redirect_to "#{frontend_url}/login?confirmed=true", allow_other_host: true
    else
      # If there's an error (e.g. token invalid or already confirmed), we redirect to login with an error param
      redirect_to "#{frontend_url}/login?error=confirmation_failed", allow_other_host: true
    end
  end
end
