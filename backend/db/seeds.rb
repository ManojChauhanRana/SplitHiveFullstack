# Sample data for the built-in demo account.
# Re-running seeds refreshes demo-owned groups only.

DemoDataBuilder.call

puts "Demo data ready."
puts "Email: demo@splithive.dev"
puts "Password: #{DemoDataBuilder::PASSWORD}"
