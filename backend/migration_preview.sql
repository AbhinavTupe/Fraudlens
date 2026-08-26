BEGIN;

CREATE TABLE alembic_version (
    version_num VARCHAR(32) NOT NULL, 
    CONSTRAINT alembic_version_pkc PRIMARY KEY (version_num)
);

-- Running upgrade  -> e1d2c3f6f977

CREATE TABLE ml_models (
    name VARCHAR(255) NOT NULL, 
    version VARCHAR(100) NOT NULL, 
    algorithm VARCHAR(100) NOT NULL, 
    description VARCHAR(1024), 
    artifact_path VARCHAR(1024), 
    metrics_path VARCHAR(1024), 
    training_dataset VARCHAR(1024), 
    is_active BOOLEAN NOT NULL, 
    accuracy FLOAT, 
    precision FLOAT, 
    recall FLOAT, 
    f1_score FLOAT, 
    roc_auc FLOAT, 
    id UUID NOT NULL, 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
    CONSTRAINT pk_ml_models PRIMARY KEY (id), 
    CONSTRAINT uq_ml_models_name_version UNIQUE (name, version)
);

CREATE INDEX ix_ml_models_algorithm ON ml_models (algorithm);

CREATE INDEX ix_ml_models_is_active ON ml_models (is_active);

CREATE INDEX ix_ml_models_name ON ml_models (name);

CREATE INDEX ix_ml_models_version ON ml_models (version);

CREATE TABLE users (
    full_name VARCHAR(255) NOT NULL, 
    email VARCHAR(255) NOT NULL, 
    password_hash VARCHAR(255) NOT NULL, 
    role VARCHAR(12) NOT NULL, 
    status VARCHAR(11) NOT NULL, 
    last_login TIMESTAMP WITH TIME ZONE, 
    id UUID NOT NULL, 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
    CONSTRAINT pk_users PRIMARY KEY (id)
);

CREATE UNIQUE INDEX ix_users_email ON users (email);

CREATE TABLE activity_logs (
    user_id UUID NOT NULL, 
    action VARCHAR(255) NOT NULL, 
    resource VARCHAR(255) NOT NULL, 
    details VARCHAR(2048), 
    ip_address VARCHAR(45), 
    user_agent VARCHAR(1024), 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
    id UUID NOT NULL, 
    CONSTRAINT pk_activity_logs PRIMARY KEY (id), 
    CONSTRAINT fk_activity_logs_user_id_users FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX ix_activity_logs_created_at ON activity_logs (created_at);

CREATE INDEX ix_activity_logs_user_id ON activity_logs (user_id);

CREATE TABLE feature_importances (
    model_id UUID NOT NULL, 
    feature_name VARCHAR(255) NOT NULL, 
    importance FLOAT NOT NULL, 
    rank INTEGER, 
    id UUID NOT NULL, 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
    CONSTRAINT pk_feature_importances PRIMARY KEY (id), 
    CONSTRAINT fk_feature_importances_model_id_ml_models FOREIGN KEY(model_id) REFERENCES ml_models (id) ON DELETE CASCADE
);

CREATE INDEX ix_feature_importances_feature_name ON feature_importances (feature_name);

CREATE INDEX ix_feature_importances_model_id ON feature_importances (model_id);

CREATE INDEX ix_feature_importances_rank ON feature_importances (rank);

CREATE TABLE settings (
    user_id UUID NOT NULL, 
    theme VARCHAR(50) NOT NULL, 
    notification_preferences VARCHAR(1024) NOT NULL, 
    dashboard_preferences VARCHAR(2048) NOT NULL, 
    id UUID NOT NULL, 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
    CONSTRAINT pk_settings PRIMARY KEY (id), 
    CONSTRAINT fk_settings_user_id_users FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE CASCADE, 
    CONSTRAINT uq_settings_user_id UNIQUE (user_id)
);

CREATE TABLE training_jobs (
    model_id UUID NOT NULL, 
    started_at TIMESTAMP WITH TIME ZONE, 
    completed_at TIMESTAMP WITH TIME ZONE, 
    status VARCHAR(9) NOT NULL, 
    parameters_json JSON, 
    metrics_json JSON, 
    epoch_count INTEGER, 
    training_accuracy FLOAT, 
    validation_accuracy FLOAT, 
    training_loss FLOAT, 
    validation_loss FLOAT, 
    artifact_path VARCHAR(1024), 
    logs_path VARCHAR(1024), 
    hyperparameters VARCHAR(2048), 
    id UUID NOT NULL, 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
    CONSTRAINT pk_training_jobs PRIMARY KEY (id), 
    CONSTRAINT fk_training_jobs_model_id_ml_models FOREIGN KEY(model_id) REFERENCES ml_models (id) ON DELETE CASCADE
);

CREATE INDEX ix_training_jobs_model_id ON training_jobs (model_id);

CREATE INDEX ix_training_jobs_started_at ON training_jobs (started_at);

CREATE INDEX ix_training_jobs_status ON training_jobs (status);

CREATE TABLE transactions (
    transaction_reference VARCHAR(128) NOT NULL, 
    amount NUMERIC(12, 2) NOT NULL, 
    currency VARCHAR(3) NOT NULL, 
    merchant VARCHAR(255), 
    merchant_category VARCHAR(100), 
    customer_id UUID, 
    transaction_type VARCHAR(50), 
    transaction_timestamp TIMESTAMP WITH TIME ZONE NOT NULL, 
    location VARCHAR(255), 
    payment_method VARCHAR(100), 
    status VARCHAR(15) NOT NULL, 
    id UUID NOT NULL, 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
    CONSTRAINT pk_transactions PRIMARY KEY (id), 
    CONSTRAINT fk_transactions_customer_id_users FOREIGN KEY(customer_id) REFERENCES users (id) ON DELETE SET NULL
);

CREATE INDEX ix_transactions_customer_id ON transactions (customer_id);

CREATE INDEX ix_transactions_status ON transactions (status);

CREATE UNIQUE INDEX ix_transactions_transaction_reference ON transactions (transaction_reference);

CREATE INDEX ix_transactions_transaction_timestamp ON transactions (transaction_timestamp);

CREATE TABLE predictions (
    transaction_id UUID NOT NULL, 
    fraud_probability FLOAT NOT NULL, 
    predicted_label VARCHAR(50) NOT NULL, 
    model_version VARCHAR(100), 
    inference_time_ms INTEGER, 
    threshold_used FLOAT, 
    id UUID NOT NULL, 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
    CONSTRAINT pk_predictions PRIMARY KEY (id), 
    CONSTRAINT fk_predictions_transaction_id_transactions FOREIGN KEY(transaction_id) REFERENCES transactions (id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX ix_predictions_transaction_id ON predictions (transaction_id);

CREATE TABLE fraud_alerts (
    transaction_id UUID NOT NULL, 
    prediction_id UUID, 
    severity VARCHAR(8) NOT NULL, 
    status VARCHAR(12) NOT NULL, 
    assigned_to UUID, 
    reviewed_at TIMESTAMP WITH TIME ZONE, 
    resolution_notes VARCHAR(2048), 
    id UUID NOT NULL, 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
    CONSTRAINT pk_fraud_alerts PRIMARY KEY (id), 
    CONSTRAINT fk_fraud_alerts_assigned_to_users FOREIGN KEY(assigned_to) REFERENCES users (id) ON DELETE SET NULL, 
    CONSTRAINT fk_fraud_alerts_prediction_id_predictions FOREIGN KEY(prediction_id) REFERENCES predictions (id) ON DELETE SET NULL, 
    CONSTRAINT fk_fraud_alerts_transaction_id_transactions FOREIGN KEY(transaction_id) REFERENCES transactions (id) ON DELETE CASCADE
);

CREATE INDEX ix_fraud_alerts_assigned_to ON fraud_alerts (assigned_to);

CREATE INDEX ix_fraud_alerts_created_at ON fraud_alerts (created_at);

CREATE UNIQUE INDEX ix_fraud_alerts_prediction_id ON fraud_alerts (prediction_id);

CREATE INDEX ix_fraud_alerts_severity ON fraud_alerts (severity);

CREATE INDEX ix_fraud_alerts_status ON fraud_alerts (status);

CREATE INDEX ix_fraud_alerts_transaction_id ON fraud_alerts (transaction_id);

CREATE TABLE investigation_cases (
    fraud_alert_id UUID NOT NULL, 
    case_number VARCHAR(64), 
    title VARCHAR(255), 
    description VARCHAR(2048), 
    status VARCHAR(19) NOT NULL, 
    priority VARCHAR(6) NOT NULL, 
    assigned_to UUID, 
    opened_at TIMESTAMP WITH TIME ZONE, 
    closed_at TIMESTAMP WITH TIME ZONE, 
    resolution VARCHAR(2048), 
    id UUID NOT NULL, 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
    CONSTRAINT pk_investigation_cases PRIMARY KEY (id), 
    CONSTRAINT fk_investigation_cases_assigned_to_users FOREIGN KEY(assigned_to) REFERENCES users (id) ON DELETE SET NULL, 
    CONSTRAINT fk_investigation_cases_fraud_alert_id_fraud_alerts FOREIGN KEY(fraud_alert_id) REFERENCES fraud_alerts (id) ON DELETE CASCADE
);

CREATE INDEX ix_investigation_cases_assigned_to ON investigation_cases (assigned_to);

CREATE UNIQUE INDEX ix_investigation_cases_fraud_alert_id ON investigation_cases (fraud_alert_id);

CREATE INDEX ix_investigation_cases_opened_at ON investigation_cases (opened_at);

CREATE INDEX ix_investigation_cases_priority ON investigation_cases (priority);

CREATE INDEX ix_investigation_cases_status ON investigation_cases (status);

CREATE TABLE case_comments (
    case_id UUID NOT NULL, 
    author_id UUID, 
    comment VARCHAR(4096) NOT NULL, 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
    id UUID NOT NULL, 
    CONSTRAINT pk_case_comments PRIMARY KEY (id), 
    CONSTRAINT fk_case_comments_author_id_users FOREIGN KEY(author_id) REFERENCES users (id) ON DELETE SET NULL, 
    CONSTRAINT fk_case_comments_case_id_investigation_cases FOREIGN KEY(case_id) REFERENCES investigation_cases (id) ON DELETE CASCADE
);

CREATE INDEX ix_case_comments_author_id ON case_comments (author_id);

CREATE INDEX ix_case_comments_case_id ON case_comments (case_id);

CREATE INDEX ix_case_comments_created_at ON case_comments (created_at);

CREATE TABLE evidences (
    case_id UUID NOT NULL, 
    filename VARCHAR(255) NOT NULL, 
    file_path VARCHAR(1024) NOT NULL, 
    file_type VARCHAR(50), 
    uploaded_by UUID, 
    file_size INTEGER, 
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
    id UUID NOT NULL, 
    CONSTRAINT pk_evidences PRIMARY KEY (id), 
    CONSTRAINT fk_evidences_case_id_investigation_cases FOREIGN KEY(case_id) REFERENCES investigation_cases (id) ON DELETE CASCADE, 
    CONSTRAINT fk_evidences_uploaded_by_users FOREIGN KEY(uploaded_by) REFERENCES users (id) ON DELETE SET NULL
);

CREATE INDEX ix_evidences_case_id ON evidences (case_id);

CREATE INDEX ix_evidences_uploaded_by ON evidences (uploaded_by);

INSERT INTO alembic_version (version_num) VALUES ('e1d2c3f6f977') RETURNING alembic_version.version_num;

COMMIT;

