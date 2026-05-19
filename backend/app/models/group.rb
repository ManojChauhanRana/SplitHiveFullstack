class Group < ApplicationRecord
  belongs_to :creator, class_name: 'User', foreign_key: 'created_by_id'
  has_many :group_members, dependent: :destroy
  has_many :members, through: :group_members, source: :user
  has_many :expenses, dependent: :destroy
  has_many :settlements, dependent: :destroy
  has_many :group_invites, dependent: :destroy

  validates :name, presence: true
end
