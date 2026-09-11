"""add IEEE-CIS source and ML feature provenance tables

Revision ID: f4a1b2c3d4e5
Revises: e1d2c3f6f977
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "f4a1b2c3d4e5"
down_revision: Union[str, None] = "e1d2c3f6f977"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column("transactions", "currency", existing_type=sa.String(length=3), nullable=True)
    op.alter_column("transactions", "transaction_timestamp", existing_type=sa.DateTime(timezone=True), nullable=True)

    op.create_table(
        "ieee_cis_source_transactions",
        sa.Column("source_dataset", sa.String(length=255), nullable=False),
        sa.Column("source_transaction_id", sa.BigInteger(), nullable=False),
        sa.Column("transaction_dt", sa.BigInteger(), nullable=False),
        sa.Column("transaction_id", sa.UUID(), nullable=False),
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["transaction_id"], ["transactions.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("source_dataset", "source_transaction_id", name="uq_ieee_cis_source_transactions_dataset_transaction"),
        sa.UniqueConstraint("transaction_id", name="uq_ieee_cis_source_transactions_transaction_id"),
    )
    op.create_index(
        "ix_ieee_cis_source_transactions_transaction_id",
        "ieee_cis_source_transactions",
        ["transaction_id"],
    )

    op.create_table(
        "ml_feature_records",
        sa.Column("transaction_id", sa.UUID(), nullable=False),
        sa.Column("source_dataset", sa.String(length=255), nullable=False),
        sa.Column("source_transaction_id", sa.BigInteger(), nullable=False),
        sa.Column("feature_contract_version", sa.String(length=100), nullable=False),
        sa.Column("feature_version", sa.String(length=100), nullable=False),
        sa.Column("transaction_amt", sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column("product_cd", sa.String(length=1), nullable=False),
        *[sa.Column(f"c{i}", sa.Numeric(precision=20, scale=6), nullable=False) for i in range(1, 15)],
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["transaction_id"], ["transactions.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("source_dataset", "source_transaction_id", "feature_contract_version", name="uq_ml_feature_records_source_contract"),
    )
    op.create_index("ix_ml_feature_records_transaction_id", "ml_feature_records", ["transaction_id"])


def downgrade() -> None:
    bind = op.get_bind()
    if bind.execute(sa.text("SELECT COUNT(*) FROM ieee_cis_source_transactions")).scalar_one():
        raise RuntimeError("Cannot downgrade while IEEE-CIS source transactions exist")

    op.drop_index("ix_ml_feature_records_transaction_id", table_name="ml_feature_records")
    op.drop_table("ml_feature_records")
    op.drop_index("ix_ieee_cis_source_transactions_transaction_id", table_name="ieee_cis_source_transactions")
    op.drop_table("ieee_cis_source_transactions")
    op.alter_column("transactions", "currency", existing_type=sa.String(length=3), nullable=False)
    op.alter_column("transactions", "transaction_timestamp", existing_type=sa.DateTime(timezone=True), nullable=False)
