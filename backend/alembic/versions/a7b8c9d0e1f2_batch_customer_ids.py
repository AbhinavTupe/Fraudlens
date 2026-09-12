"""allow batch transactions to retain external customer UUIDs

Revision ID: a7b8c9d0e1f2
Revises: f4a1b2c3d4e5
"""

from typing import Sequence, Union

from alembic import op


revision: str = "a7b8c9d0e1f2"
down_revision: Union[str, None] = "f4a1b2c3d4e5"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.drop_constraint("fk_transactions_customer_id_users", "transactions", type_="foreignkey")


def downgrade() -> None:
    op.create_foreign_key(
        "fk_transactions_customer_id_users",
        "transactions",
        "users",
        ["customer_id"],
        ["id"],
        ondelete="SET NULL",
    )