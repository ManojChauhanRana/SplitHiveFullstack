Rails.application.routes.draw do

  get "up" => "rails/health#show", as: :rails_health_check
  devise_for :users, controllers: {
    sessions: 'users/sessions',
    registrations: 'users/registrations',
    confirmations: 'users/confirmations',
    passwords: 'users/passwords'
  }
  
  resources :groups do
    resources :expenses, only: [:index, :create]
    resources :settlements, only: [:index, :create]
    resources :members, only: [:index, :create]
    resources :invites, only: [:index, :create]
  end

  post '/invites/platform', to: 'invites#platform'
  post '/invites/accept', to: 'invites#accept'
  post '/demo/prepare', to: 'demo#prepare'
  get '/profile', to: 'users#profile'
  get '/dashboard', to: 'dashboard#index'
end
