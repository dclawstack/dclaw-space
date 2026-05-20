"""domain models: floors, desks, rooms, bookings

Revision ID: 001
Revises:
Create Date: 2026-05-21
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("CREATE TYPE booking_status AS ENUM ('confirmed', 'cancelled', 'checked_in', 'no_show')")

    op.create_table(
        "floors",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("name", sa.String(100), nullable=False),
        sa.Column("level", sa.Integer(), nullable=False),
        sa.Column("svg_data", sa.Text(), nullable=True),
        sa.Column("width", sa.Integer(), nullable=False, server_default="1000"),
        sa.Column("height", sa.Integer(), nullable=False, server_default="800"),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "desks",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("floor_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("label", sa.String(50), nullable=False),
        sa.Column("zone", sa.String(50), nullable=True),
        sa.Column("x", sa.Float(), nullable=False, server_default="0"),
        sa.Column("y", sa.Float(), nullable=False, server_default="0"),
        sa.Column("amenities", postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["floor_id"], ["floors.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_desks_floor_id", "desks", ["floor_id"])

    op.create_table(
        "rooms",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("floor_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("name", sa.String(100), nullable=False),
        sa.Column("capacity", sa.Integer(), nullable=False),
        sa.Column("equipment", postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column("x", sa.Float(), nullable=False, server_default="0"),
        sa.Column("y", sa.Float(), nullable=False, server_default="0"),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["floor_id"], ["floors.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_rooms_floor_id", "rooms", ["floor_id"])

    op.create_table(
        "desk_bookings",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("desk_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", sa.String(100), nullable=False),
        sa.Column("date", sa.Date(), nullable=False),
        sa.Column("status", postgresql.ENUM(name="booking_status", create_type=False), nullable=False),
        sa.Column("checked_in_at", sa.DateTime(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["desk_id"], ["desks.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_desk_bookings_user_id", "desk_bookings", ["user_id"])
    op.create_index("ix_desk_bookings_date", "desk_bookings", ["date"])
    op.create_index("ix_desk_bookings_desk_date", "desk_bookings", ["desk_id", "date"])

    op.create_table(
        "room_bookings",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("room_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", sa.String(100), nullable=False),
        sa.Column("title", sa.String(200), nullable=False),
        sa.Column("start_dt", sa.DateTime(), nullable=False),
        sa.Column("end_dt", sa.DateTime(), nullable=False),
        sa.Column("attendee_count", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("status", postgresql.ENUM(name="booking_status", create_type=False), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["room_id"], ["rooms.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_room_bookings_user_id", "room_bookings", ["user_id"])
    op.create_index("ix_room_bookings_room_start", "room_bookings", ["room_id", "start_dt"])


def downgrade() -> None:
    op.drop_table("room_bookings")
    op.drop_table("desk_bookings")
    op.drop_table("rooms")
    op.drop_table("desks")
    op.drop_table("floors")
    op.execute("DROP TYPE booking_status")
