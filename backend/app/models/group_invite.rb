class GroupInvite < ApplicationRecord
  belongs_to :group
  belongs_to :inviter, class_name: 'User', foreign_key: 'invited_by_id'

  validates :email, presence: true
end
