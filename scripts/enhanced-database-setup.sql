-- Enhanced database schema with new features

-- Add adoption-related tables
CREATE TABLE IF NOT EXISTS adoption_listings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    pet_name VARCHAR(255) NOT NULL,
    species VARCHAR(100) NOT NULL,
    breed VARCHAR(255),
    age INTEGER,
    gender VARCHAR(20),
    size VARCHAR(50),
    temperament TEXT,
    description TEXT NOT NULL,
    medical_history TEXT,
    vaccination_status TEXT,
    spayed_neutered BOOLEAN DEFAULT FALSE,
    good_with_kids BOOLEAN DEFAULT FALSE,
    good_with_pets BOOLEAN DEFAULT FALSE,
    energy_level VARCHAR(50),
    photos TEXT[], -- Array of photo URLs
    adoption_fee DECIMAL(10,2) DEFAULT 0,
    location VARCHAR(255),
    contact_phone VARCHAR(20),
    contact_email VARCHAR(255),
    status VARCHAR(50) DEFAULT 'available' CHECK (status IN ('available', 'pending', 'adopted', 'withdrawn')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adoption applications
CREATE TABLE IF NOT EXISTS adoption_applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    listing_id UUID REFERENCES adoption_listings(id) ON DELETE CASCADE,
    applicant_id UUID REFERENCES users(id) ON DELETE CASCADE,
    application_data JSONB NOT NULL, -- Store form responses
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'withdrawn')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced lost pets table with better search capabilities
ALTER TABLE lost_pets ADD COLUMN IF NOT EXISTS species VARCHAR(100);
ALTER TABLE lost_pets ADD COLUMN IF NOT EXISTS breed VARCHAR(255);
ALTER TABLE lost_pets ADD COLUMN IF NOT EXISTS color VARCHAR(100);
ALTER TABLE lost_pets ADD COLUMN IF NOT EXISTS size VARCHAR(50);
ALTER TABLE lost_pets ADD COLUMN IF NOT EXISTS distinctive_features TEXT;
ALTER TABLE lost_pets ADD COLUMN IF NOT EXISTS last_seen_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE lost_pets ADD COLUMN IF NOT EXISTS microchip_id VARCHAR(50);
ALTER TABLE lost_pets ADD COLUMN IF NOT EXISTS photos TEXT[];

-- M-Pesa transactions table
CREATE TABLE IF NOT EXISTS mpesa_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    payment_id UUID REFERENCES payments(id),
    merchant_request_id VARCHAR(255),
    checkout_request_id VARCHAR(255),
    result_code INTEGER,
    result_desc TEXT,
    mpesa_receipt_number VARCHAR(255),
    transaction_date TIMESTAMP WITH TIME ZONE,
    phone_number VARCHAR(20),
    amount DECIMAL(10,2),
    account_reference VARCHAR(255),
    transaction_desc TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'appointment', 'payment', 'reminder', 'lost_pet', 'adoption'
    data JSONB, -- Additional data for the notification
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reminders table
CREATE TABLE IF NOT EXISTS reminders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    pet_id UUID REFERENCES pets(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'vaccination', 'medication', 'checkup', 'grooming'
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    recurring BOOLEAN DEFAULT FALSE,
    recurring_interval VARCHAR(50), -- 'daily', 'weekly', 'monthly', 'yearly'
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'dismissed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages table for in-app messaging
CREATE TABLE IF NOT EXISTS messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID NOT NULL,
    sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
    recipient_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    message_type VARCHAR(50) DEFAULT 'text', -- 'text', 'image', 'file'
    file_url TEXT,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System analytics table
CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_type VARCHAR(100) NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscription plans
CREATE TABLE IF NOT EXISTS subscription_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    billing_interval VARCHAR(20) NOT NULL, -- 'monthly', 'yearly'
    features JSONB NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User subscriptions
CREATE TABLE IF NOT EXISTS user_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES subscription_plans(id),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'past_due')),
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_adoption_listings_status ON adoption_listings(status);
CREATE INDEX IF NOT EXISTS idx_adoption_listings_species ON adoption_listings(species);
CREATE INDEX IF NOT EXISTS idx_adoption_listings_location ON adoption_listings(location);
CREATE INDEX IF NOT EXISTS idx_lost_pets_species ON lost_pets(species);
CREATE INDEX IF NOT EXISTS idx_lost_pets_location ON lost_pets(location);
CREATE INDEX IF NOT EXISTS idx_lost_pets_status ON lost_pets(status);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_reminders_user_id ON reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_due_date ON reminders(due_date);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at);
