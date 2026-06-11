-- NGO Bedarfsliste (what NGOs need)
CREATE TABLE ngo_needs (
    id SERIAL PRIMARY KEY,
    ngo_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    category VARCHAR(100) NOT NULL CHECK (category IN ('Oberteil', 'Unterteil', 'Schuhe', 'Zubehör', 'Sonstiges')),
    gender VARCHAR(30) CHECK (gender IN ('Herren', 'Frauen', 'Kinder', 'Unisex')),
    size VARCHAR(20),
    quantity_needed INTEGER NOT NULL CHECK (quantity_needed > 0),
    quantity_received INTEGER NOT NULL DEFAULT 0 CHECK (quantity_received >= 0),
    country VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    description TEXT,
    image_urls TEXT[] NOT NULL DEFAULT '{}',
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'fulfilled', 'closed')),
    needed_by DATE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ngo_needs_ngo_user_id ON ngo_needs(ngo_user_id);
CREATE INDEX idx_ngo_needs_status ON ngo_needs(status);
CREATE INDEX idx_ngo_needs_category ON ngo_needs(category);
CREATE INDEX idx_ngo_needs_location ON ngo_needs(country, city);

-- Spendenangebote von Spendern
CREATE TABLE donations (
    id SERIAL PRIMARY KEY,
    donor_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    ngo_need_id INTEGER REFERENCES ngo_needs(id) ON DELETE SET NULL,
    ngo_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    item_name VARCHAR(200) NOT NULL,
    category VARCHAR(100) NOT NULL CHECK (category IN ('Oberteil', 'Unterteil', 'Schuhe', 'Zubehör', 'Sonstiges')),
    gender VARCHAR(30) CHECK (gender IN ('Herren', 'Frauen', 'Kinder', 'Unisex')),
    size VARCHAR(20),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    condition VARCHAR(30) NOT NULL DEFAULT 'good' CHECK (condition IN ('new', 'like_new', 'good', 'acceptable')),
    country VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    notes TEXT,
    image_urls TEXT[] NOT NULL DEFAULT '{}',
    status VARCHAR(30) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'in_transit', 'delivered', 'cancelled')),
    accepted_at TIMESTAMP,
    delivered_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_donations_receiver
        CHECK (ngo_need_id IS NOT NULL OR ngo_user_id IS NOT NULL)
);

CREATE INDEX idx_donations_donor_user_id ON donations(donor_user_id);
CREATE INDEX idx_donations_ngo_need_id ON donations(ngo_need_id);
CREATE INDEX idx_donations_ngo_user_id ON donations(ngo_user_id);
CREATE INDEX idx_donations_status ON donations(status);
CREATE INDEX idx_donations_category ON donations(category);
CREATE INDEX idx_donations_location ON donations(country, city);
