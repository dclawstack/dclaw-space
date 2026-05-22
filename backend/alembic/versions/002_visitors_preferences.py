"""visitors and user_preferences tables

Revision ID: 002
Revises: 001
Create Date: 2026-05-22
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "002"
down_revision = "001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("CREATE TYPE visitor_status AS ENUM ('expected', 'checked_in', 'checked_out', 'cancelled')")

    op.create_table(
        "visitors",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("host_user_id", sa.String(100), nullable=False),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("email", sa.String(200), nullable=False),
        sa.Column("company", sa.String(200), nullable=True),
        sa.Column("expected_at", sa.DateTime(), nullable=False),
        sa.Column("status", postgresql.ENUM(name="visitor_status", create_type=False), nullable=False),
        sa.Column("badge_token", sa.String(64), nullable=False),
        sa.Column("notes", sa.String(500), nullable=True),
        sa.Column("checked_in_at", sa.DateTime(), nullable=True),
        sa.Column("checked_out_at", sa.DateTime(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_visitors_host_user_id", "visitors", ["host_user_id"])
    op.create_index("ix_visitors_expected_at", "visitors", ["expected_at"])

    op.create_table(
        "user_preferences",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", sa.String(100), nullable=False),
        sa.Column("preferred_floor_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("preferred_zone", sa.String(50), nullable=True),
        sa.Column("preferred_desk_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("booking_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["preferred_floor_id"], ["floors.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["preferred_desk_id"], ["desks.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id"),
    )
    op.create_index("ix_user_preferences_user_id", "user_preferences", ["user_id"])


def downgrade() -> None:
    op.drop_table("user_preferences")
    op.drop_table("visitors")
    op.execute("DROP TYPE visitor_status")
