class Expense < ApplicationRecord
  belongs_to :group
  belongs_to :payer, class_name: 'User', foreign_key: 'paid_by_id'
  belongs_to :creator, class_name: 'User', foreign_key: 'created_by_id', optional: true
  
  has_many :expense_participants, dependent: :destroy
  has_many :participants, through: :expense_participants, source: :user

  validates :title, :total_amount, presence: true
end
