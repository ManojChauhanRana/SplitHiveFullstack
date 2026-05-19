class DemoController < ApplicationController
  def prepare
    user = DemoDataBuilder.call
    render json: {
      status: { code: 200, message: "Demo account is ready." },
      email: user.email
    }, status: :ok
  end
end
