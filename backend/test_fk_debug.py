from app.core.database import SessionLocal
from app.models.models import Resume, CoverLetter
import uuid

db = SessionLocal()
# Create a dummy resume
r = Resume(
    id=str(uuid.uuid4()),
    title="Test FK Resume",
    file_name="test.pdf",
    raw_text="Test"
)
db.add(r)
db.commit()

# Create a cover letter pointing to this resume
cl = CoverLetter(
    id=str(uuid.uuid4()),
    resume_id=r.id,
    title="Test CL",
    content="Test"
)
db.add(cl)
db.commit()

# Now try deleting the resume
try:
    db.delete(r)
    db.commit()
    print("SUCCESS: Deleted resume with cover letter referencing it")
except Exception as e:
    print("FAILED TO DELETE:", e)
    db.rollback()
finally:
    db.query(CoverLetter).filter(CoverLetter.id == cl.id).delete()
    db.query(Resume).filter(Resume.id == r.id).delete()
    db.commit()
