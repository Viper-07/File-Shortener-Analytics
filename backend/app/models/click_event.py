from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database.connection import Base

class ClickEvent(Base):
    __tablename__ = "click_events"

    id = Column(Integer, primary_key=True, index=True)
    link_id = Column(Integer, ForeignKey("links.id", ondelete="CASCADE"), nullable=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    ip_address = Column(String)
    user_agent = Column(String)
    referrer = Column(String)
    country = Column(String, default="Unknown")
    city = Column(String, default="Unknown")
    browser = Column(String)
    os = Column(String)
    device = Column(String)

    link = relationship("Link", backref="clicks")
