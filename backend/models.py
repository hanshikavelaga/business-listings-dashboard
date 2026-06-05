from pydantic import BaseModel

class ListingModel(BaseModel):
    business_name: str
    category: str
    city: str
    address: str
    phone: str
    source: str