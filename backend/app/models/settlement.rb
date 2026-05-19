class Settlement < ApplicationRecord
  belongs_to :group
  belongs_to :payer, class_name: 'User', foreign_key: 'payer_id'
  belongs_to :receiver, class_name: 'User', foreign_key: 'receiver_id'
  belongs_to :creator, class_name: 'User', foreign_key: 'created_by_id', optional: true

  validates :amount, presence: true
end
