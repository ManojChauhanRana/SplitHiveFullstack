class SettlementsController < ApplicationController
  before_action :authenticate_user!

  def index
    @group = current_user.groups.find(params[:group_id])
    @settlements = @group.settlements.order(created_at: :desc)
    render json: @settlements
  end

  def create
    @group = current_user.groups.find(params[:group_id])
    @settlement = @group.settlements.new(settlement_params)
    @settlement.creator = current_user
    validate_group_member(@settlement.payer_id, "Payer")
    validate_group_member(@settlement.receiver_id, "Receiver")
    @settlement.errors.add(:receiver_id, "must be different from payer") if @settlement.payer_id == @settlement.receiver_id

    if @settlement.errors.empty? && @settlement.save
      render json: @settlement, status: :created
    else
      render json: @settlement.errors, status: :unprocessable_entity
    end
  end

  private

  def settlement_params
    params.require(:settlement).permit(:payer_id, :receiver_id, :amount)
  end

  def validate_group_member(user_id, label)
    return if user_id.present? && @group.members.exists?(id: user_id)

    @settlement.errors.add(:base, "#{label} must be a group member")
  end
end
