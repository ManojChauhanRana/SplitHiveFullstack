class DemoDataBuilder
  PASSWORD = "Password123!".freeze
  USERS = [
    { email: "demo@splithive.dev", full_name: "Aarav Mehta" },
    { email: "nisha@splithive.dev", full_name: "Nisha Shah" },
    { email: "kabir@splithive.dev", full_name: "Kabir Rao" },
    { email: "meera@splithive.dev", full_name: "Meera Iyer" },
    { email: "rohan@splithive.dev", full_name: "Rohan Kapoor" }
  ].freeze
  GROUP_NAMES = ["Goa Trip", "Apartment Roommates", "Office Lunch"].freeze

  def self.call
    new.call
  end

  def call
    users = USERS.to_h { |attributes| [attributes[:email], demo_user(attributes)] }
    demo = users.fetch("demo@splithive.dev")

    demo.created_groups.where(name: GROUP_NAMES).destroy_all

    create_goa_trip(users, demo)
    create_apartment(users, demo)
    create_office_lunch(users, demo)

    demo
  end

  private

  def demo_user(attributes)
    user = User.find_or_initialize_by(email: attributes[:email])
    user.assign_attributes(
      full_name: attributes[:full_name],
      password: PASSWORD,
      password_confirmation: PASSWORD,
      confirmed_at: user.confirmed_at || Time.current,
      jti: user.jti.presence || SecureRandom.uuid
    )
    user.save!
    user
  end

  def add_members(group, members, creator)
    members.each do |member|
      group.group_members.find_or_create_by!(user: member) do |group_member|
        group_member.creator = creator
        group_member.joined_at = Time.current
      end
    end
  end

  def add_expense(group:, creator:, payer:, title:, category:, items:, participants:)
    total = items.sum { |item| item.fetch(:quantity) * item.fetch(:amount) }
    expense = group.expenses.create!(
      creator: creator,
      payer: payer,
      title: title,
      category: category,
      description: { items: items }.to_json,
      quantity: items.sum { |item| item.fetch(:quantity) },
      total_amount: total
    )

    share = (total / participants.length).round(2)
    participants.each do |participant|
      expense.expense_participants.create!(user: participant, share_amount: share)
    end
  end

  def create_goa_trip(users, demo)
    goa = demo.created_groups.create!(name: "Goa Trip")
    add_members(goa, users.values_at("demo@splithive.dev", "nisha@splithive.dev", "kabir@splithive.dev", "meera@splithive.dev"), demo)
    add_expense(
      group: goa,
      creator: demo,
      payer: demo,
      title: "Beach dinner",
      category: "Food",
      items: [
        { name: "Seafood platter", quantity: 2, amount: 42.50 },
        { name: "Mocktails", quantity: 4, amount: 7.25 },
        { name: "Dessert", quantity: 2, amount: 8.00 }
      ],
      participants: users.values_at("demo@splithive.dev", "nisha@splithive.dev", "kabir@splithive.dev", "meera@splithive.dev")
    )
    add_expense(
      group: goa,
      creator: users.fetch("nisha@splithive.dev"),
      payer: users.fetch("nisha@splithive.dev"),
      title: "Airport cab",
      category: "Travel",
      items: [
        { name: "Airport transfer", quantity: 1, amount: 68.00 }
      ],
      participants: users.values_at("demo@splithive.dev", "nisha@splithive.dev", "kabir@splithive.dev")
    )
    goa.settlements.create!(payer: demo, receiver: users.fetch("nisha@splithive.dev"), creator: demo, amount: 12.00)
  end

  def create_apartment(users, demo)
    apartment = demo.created_groups.create!(name: "Apartment Roommates")
    add_members(apartment, users.values_at("demo@splithive.dev", "kabir@splithive.dev", "rohan@splithive.dev"), demo)
    add_expense(
      group: apartment,
      creator: users.fetch("kabir@splithive.dev"),
      payer: users.fetch("kabir@splithive.dev"),
      title: "Monthly utilities",
      category: "Home",
      items: [
        { name: "Electricity", quantity: 1, amount: 86.40 },
        { name: "Internet", quantity: 1, amount: 55.00 },
        { name: "Water", quantity: 1, amount: 24.60 }
      ],
      participants: users.values_at("demo@splithive.dev", "kabir@splithive.dev", "rohan@splithive.dev")
    )
    add_expense(
      group: apartment,
      creator: demo,
      payer: demo,
      title: "Kitchen restock",
      category: "Groceries",
      items: [
        { name: "Coffee", quantity: 2, amount: 13.75 },
        { name: "Cleaning supplies", quantity: 1, amount: 31.20 },
        { name: "Snacks", quantity: 5, amount: 4.40 }
      ],
      participants: users.values_at("demo@splithive.dev", "kabir@splithive.dev")
    )
  end

  def create_office_lunch(users, demo)
    office = demo.created_groups.create!(name: "Office Lunch")
    add_members(office, users.values_at("demo@splithive.dev", "nisha@splithive.dev", "meera@splithive.dev", "rohan@splithive.dev"), demo)
    add_expense(
      group: office,
      creator: users.fetch("meera@splithive.dev"),
      payer: users.fetch("meera@splithive.dev"),
      title: "Friday lunch",
      category: "Food",
      items: [
        { name: "Veg bowls", quantity: 3, amount: 12.00 },
        { name: "Chicken bowls", quantity: 2, amount: 14.50 },
        { name: "Cold coffee", quantity: 5, amount: 5.25 }
      ],
      participants: users.values_at("demo@splithive.dev", "nisha@splithive.dev", "meera@splithive.dev", "rohan@splithive.dev")
    )
    office.settlements.create!(payer: demo, receiver: users.fetch("meera@splithive.dev"), creator: demo, amount: 8.00)
  end
end
