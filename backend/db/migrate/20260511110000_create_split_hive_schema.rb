class CreateSplitHiveSchema < ActiveRecord::Migration[8.0]
  def change
    # Groups
    create_table :groups do |t|
      t.string :name, null: false
      t.references :created_by, null: false, foreign_key: { to_table: :users }
      t.timestamps
    end

    # Group Members
    create_table :group_members do |t|
      t.references :group, null: false, foreign_key: true
      t.references :user, null: false, foreign_key: true
      t.boolean :is_active, default: true
      t.datetime :joined_at
      t.references :created_by, foreign_key: { to_table: :users }
      t.timestamps
    end
    add_index :group_members, [:group_id, :user_id], unique: true

    # Expenses
    create_table :expenses do |t|
      t.references :group, null: false, foreign_key: true
      t.references :paid_by, null: false, foreign_key: { to_table: :users }
      t.string :title, null: false
      t.text :description
      t.decimal :total_amount, precision: 10, scale: 2, null: false
      t.integer :quantity, default: 1
      t.string :image_url
      t.string :category
      t.references :created_by, foreign_key: { to_table: :users }
      t.timestamps
    end

    # Expense Participants
    create_table :expense_participants do |t|
      t.references :expense, null: false, foreign_key: true
      t.references :user, null: false, foreign_key: true
      t.decimal :share_amount, precision: 10, scale: 2, null: false
      t.boolean :is_paid, default: false
      t.timestamps
    end
    add_index :expense_participants, [:expense_id, :user_id], unique: true

    # Settlements
    create_table :settlements do |t|
      t.references :group, null: false, foreign_key: true
      t.references :payer, null: false, foreign_key: { to_table: :users }
      t.references :receiver, null: false, foreign_key: { to_table: :users }
      t.decimal :amount, precision: 10, scale: 2, null: false
      t.references :created_by, foreign_key: { to_table: :users }
      t.timestamps
    end

    # Group Invites
    create_table :group_invites do |t|
      t.references :group, null: false, foreign_key: true
      t.string :email, null: false
      t.references :invited_by, null: false, foreign_key: { to_table: :users }
      t.string :status, default: 'pending'
      t.timestamps
    end
  end
end
