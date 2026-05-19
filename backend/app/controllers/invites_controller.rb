class InvitesController < ApplicationController
  before_action :authenticate_user!, except: [:accept]

  def create
    @group = current_user.groups.find(params[:group_id])
    @invite = @group.group_invites.new(invite_params)
    @invite.inviter = current_user

    if @invite.save
      GroupMailer.invitation_email(@invite).deliver_now
      render json: { message: "Invitation sent to #{params[:email]}" }, status: :created
    else
      render json: @invite.errors, status: :unprocessable_entity
    end
  end

  def platform
    email = platform_invite_params[:email].to_s.downcase
    if User.exists?(["LOWER(email) = ?", email])
      render json: { message: "That email is already registered on SplitHive." }, status: :unprocessable_entity
      return
    end

    GroupMailer.platform_invitation_email(email, current_user).deliver_now

    render json: { message: "Invitation sent to #{email}" }, status: :created
  end

  def accept
    result = GroupInvitationAcceptor.accept(params[:token])

    case result.status
    when :joined
      render json: {
        status: "joined",
        message: "You have joined #{result.group.name}.",
        group_id: result.group.id,
        email: result.email
      }
    when :registration_required
      render json: {
        status: "registration_required",
        message: "Create an account or log in to join #{result.group.name}.",
        group_id: result.group.id,
        email: result.email
      }, status: :accepted
    else
      render json: { status: result.status, message: result.message }, status: :unprocessable_entity
    end
  end

  private

  def invite_params
    params.permit(:email)
  end

  def platform_invite_params
    params.permit(:email)
  end
end
