class GroupsController < ApplicationController
  before_action :authenticate_user!

  def index
    @groups = current_user.groups.includes(:settlements, expenses: :expense_participants)
    render json: @groups, include: [:settlements, { expenses: { include: :expense_participants } }]
  end

  def show
    @group = current_user.groups.find(params[:id])
    render json: @group, include: [:members, :settlements, { expenses: { include: :expense_participants } }]
  end

  def create
    @group = current_user.created_groups.new(group_params)
    
    if @group.save
      @group.group_members.create(user: current_user, creator: current_user)
      render json: @group, status: :created
    else
      render json: @group.errors, status: :unprocessable_entity
    end
  end

  private

  def group_params
    params.require(:group).permit(:name)
  end
end
