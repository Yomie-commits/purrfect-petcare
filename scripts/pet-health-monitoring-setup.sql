-- Enhanced pet profiles with comprehensive health tracking
ALTER TABLE pets ADD COLUMN IF NOT EXISTS microchip_id VARCHAR(50);
ALTER TABLE pets ADD COLUMN IF NOT EXISTS insurance_info JSONB;
ALTER TABLE pets ADD COLUMN IF NOT EXISTS emergency_contact JSONB;
ALTER TABLE pets ADD COLUMN IF NOT EXISTS dietary_requirements TEXT;
ALTER TABLE pets ADD COLUMN IF NOT EXISTS allergies TEXT[];
ALTER TABLE pets ADD COLUMN IF NOT EXISTS medications JSONB[];
ALTER TABLE pets ADD COLUMN IF NOT EXISTS behavioral_notes TEXT;
ALTER TABLE pets ADD COLUMN IF NOT EXISTS activity_level VARCHAR(50);
ALTER TABLE pets ADD COLUMN IF NOT EXISTS spayed_neutered BOOLEAN DEFAULT FALSE;
ALTER TABLE pets ADD COLUMN IF NOT EXISTS last_checkup DATE;
ALTER TABLE pets ADD COLUMN IF NOT EXISTS next_checkup DATE;

-- Health monitoring data
CREATE TABLE IF NOT EXISTS health_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    pet_id UUID REFERENCES pets(id) ON DELETE CASCADE,
    record_type VARCHAR(100) NOT NULL, -- 'checkup', 'vaccination', 'treatment', 'surgery', 'emergency'
    date DATE NOT NULL,
    veterinarian VARCHAR(255),
    clinic VARCHAR(255),
    diagnosis TEXT,
    treatment TEXT,
    medications JSONB,
    notes TEXT,
    follow_up_required BOOLEAN DEFAULT FALSE,
    follow_up_date DATE,
    attachments TEXT[], -- URLs to documents/images
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vaccination tracking
CREATE TABLE IF NOT EXISTS vaccinations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    pet_id UUID REFERENCES pets(id) ON DELETE CASCADE,
    vaccine_name VARCHAR(255) NOT NULL,
    vaccine_type VARCHAR(100) NOT NULL, -- 'core', 'non-core', 'lifestyle'
    date_administered DATE NOT NULL,
    next_due_date DATE,
    veterinarian VARCHAR(255),
    clinic VARCHAR(255),
    batch_number VARCHAR(100),
    manufacturer VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Health monitoring data
CREATE TABLE IF NOT EXISTS health_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    pet_id UUID REFERENCES pets(id) ON DELETE CASCADE,
    metric_type VARCHAR(100) NOT NULL, -- 'weight', 'temperature', 'heart_rate', 'activity', 'eating', 'behavior'
    value DECIMAL(10,2) NOT NULL,
    unit VARCHAR(20), -- 'kg', 'celsius', 'bpm', 'minutes', 'grams'
    recorded_at TIMESTAMP WITH TIME ZONE NOT NULL,
    source VARCHAR(50) DEFAULT 'manual', -- 'manual', 'iot_device', 'app', 'vet'
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Health alerts and recommendations
CREATE TABLE IF NOT EXISTS health_alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    pet_id UUID REFERENCES pets(id) ON DELETE CASCADE,
    alert_type VARCHAR(100) NOT NULL, -- 'weight_change', 'activity_decrease', 'eating_pattern', 'behavior_change'
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    recommendations TEXT,
    triggered_by JSONB, -- Data that triggered the alert
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'resolved', 'dismissed')),
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Video consultation sessions
CREATE TABLE IF NOT EXISTS video_consultations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    appointment_id UUID REFERENCES appointments(id),
    pet_id UUID REFERENCES pets(id) ON DELETE CASCADE,
    pet_owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
    veterinarian_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_url VARCHAR(500),
    session_id VARCHAR(255),
    scheduled_start TIMESTAMP WITH TIME ZONE NOT NULL,
    actual_start TIMESTAMP WITH TIME ZONE,
    actual_end TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER,
    status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled', 'no_show')),
    consultation_notes TEXT,
    prescription JSONB,
    follow_up_required BOOLEAN DEFAULT FALSE,
    follow_up_date DATE,
    recording_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced appointments with time slots
CREATE TABLE IF NOT EXISTS appointment_slots (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    veterinarian_id UUID REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    slot_type VARCHAR(50) DEFAULT 'regular' CHECK (slot_type IN ('regular', 'emergency', 'consultation', 'video')),
    is_available BOOLEAN DEFAULT TRUE,
    max_bookings INTEGER DEFAULT 1,
    current_bookings INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pet photos and documents
CREATE TABLE IF NOT EXISTS pet_media (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    pet_id UUID REFERENCES pets(id) ON DELETE CASCADE,
    media_type VARCHAR(50) NOT NULL, -- 'photo', 'document', 'video'
    file_url VARCHAR(500) NOT NULL,
    file_name VARCHAR(255),
    file_size INTEGER,
    mime_type VARCHAR(100),
    category VARCHAR(100), -- 'profile', 'medical', 'vaccination', 'insurance', 'other'
    description TEXT,
    is_primary BOOLEAN DEFAULT FALSE,
    uploaded_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Behavioral tracking
CREATE TABLE IF NOT EXISTS behavior_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    pet_id UUID REFERENCES pets(id) ON DELETE CASCADE,
    behavior_type VARCHAR(100) NOT NULL, -- 'eating', 'sleeping', 'playing', 'aggression', 'anxiety', 'training'
    description TEXT NOT NULL,
    intensity VARCHAR(20), -- 'low', 'medium', 'high'
    duration_minutes INTEGER,
    triggers TEXT,
    location VARCHAR(100),
    weather_conditions VARCHAR(100),
    logged_at TIMESTAMP WITH TIME ZONE NOT NULL,
    logged_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_health_records_pet_id ON health_records(pet_id);
CREATE INDEX IF NOT EXISTS idx_health_records_date ON health_records(date);
CREATE INDEX IF NOT EXISTS idx_vaccinations_pet_id ON vaccinations(pet_id);
CREATE INDEX IF NOT EXISTS idx_vaccinations_next_due ON vaccinations(next_due_date);
CREATE INDEX IF NOT EXISTS idx_health_metrics_pet_id ON health_metrics(pet_id);
CREATE INDEX IF NOT EXISTS idx_health_metrics_type ON health_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_health_metrics_recorded_at ON health_metrics(recorded_at);
CREATE INDEX IF NOT EXISTS idx_health_alerts_pet_id ON health_alerts(pet_id);
CREATE INDEX IF NOT EXISTS idx_health_alerts_status ON health_alerts(status);
CREATE INDEX IF NOT EXISTS idx_video_consultations_pet_id ON video_consultations(pet_id);
CREATE INDEX IF NOT EXISTS idx_video_consultations_vet_id ON video_consultations(veterinarian_id);
CREATE INDEX IF NOT EXISTS idx_appointment_slots_vet_date ON appointment_slots(veterinarian_id, date);
CREATE INDEX IF NOT EXISTS idx_pet_media_pet_id ON pet_media(pet_id);
CREATE INDEX IF NOT EXISTS idx_behavior_logs_pet_id ON behavior_logs(pet_id);
CREATE INDEX IF NOT EXISTS idx_behavior_logs_type ON behavior_logs(behavior_type);
