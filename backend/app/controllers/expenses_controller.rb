class ExpensesController < ApplicationController
  before_action :authenticate_user!

  def index
    @group = current_user.groups.find(params[:group_id])
    @expenses = @group.expenses.includes(:expense_participants).order(created_at: :desc)
    render json: @expenses, include: :expense_participants
  end

  def create
    @group = current_user.groups.find(params[:group_id])
    @expense = @group.expenses.new(expense_params)
    @expense.creator = current_user
    @expense.payer ||= current_user
    participants = participant_params

    if participants.blank?
      render json: { base: ["Select at least one participant"] }, status: :unprocessable_entity
      return
    end

    Expense.transaction do
      if @expense.save
        participants.each do |participant|
          user_id = participant[:user_id]
          unless @group.members.exists?(id: user_id)
            @expense.errors.add(:base, "Participant must be a group member")
            raise ActiveRecord::Rollback
          end

          @expense.expense_participants.create!(
            user_id: user_id,
            share_amount: participant[:share_amount]
          )
        end

        render json: @expense, include: :expense_participants, status: :created
      else
        render json: @expense.errors, status: :unprocessable_entity
      end
    end

    render json: @expense.errors, status: :unprocessable_entity if @expense.errors.any? && !performed?
  end

  private

  def expense_params
    params.require(:expense).permit(:title, :description, :total_amount, :quantity, :image_url, :category, :paid_by_id)
  end

  def participant_params
    params.fetch(:participants, []).map do |participant|
      participant.permit(:user_id, :share_amount)
    end
  end
end
