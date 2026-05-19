class ExpenseParticipant < ApplicationRecord
  belongs_to :expense
  belongs_to :user

  validates :share_amount, presence: true
  validates :user_id, uniqueness: { scope: :expense_id }
end
