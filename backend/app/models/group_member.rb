class GroupMember < ApplicationRecord
  belongs_to :group
  belongs_to :user
  belongs_to :creator, class_name: 'User', foreign_key: 'created_by_id', optional: true

  validates :user_id, uniqueness: { scope: :group_id }
end
