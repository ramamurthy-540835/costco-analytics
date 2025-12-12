"""
Costco Business Center - Sample Data Generator
Generates realistic data for POC demonstration
"""
import random
import json
from datetime import datetime, timedelta
from typing import List, Dict
import csv

# Configuration
NUM_LEADS = 500
NUM_MEMBERS = 200
NUM_SALES = 2000
START_DATE = datetime(2024, 1, 1)
END_DATE = datetime(2025, 12, 31)

# Reference Data
WAREHOUSES = [
    {"warehouse_id": 115, "name": "Business Center #115", "region": "West", "city": "Las Vegas", "state": "NV"},
    {"warehouse_id": 120, "name": "Business Center #120", "region": "West", "city": "Los Angeles", "state": "CA"},
    {"warehouse_id": 130, "name": "Business Center #130", "region": "Northwest", "city": "Seattle", "state": "WA"},
    {"warehouse_id": 140, "name": "Business Center #140", "region": "Southwest", "city": "Phoenix", "state": "AZ"},
    {"warehouse_id": 150, "name": "Business Center #150", "region": "Central", "city": "Denver", "state": "CO"},
]

MARKETERS = [
    {"marketer_id": 1001, "name": "John Smith", "warehouse_id": 120},
    {"marketer_id": 1002, "name": "Emily Davis", "warehouse_id": 120},
    {"marketer_id": 1003, "name": "Marcus Thompson", "warehouse_id": 115},
    {"marketer_id": 1004, "name": "Lisa Wang", "warehouse_id": 115},
    {"marketer_id": 1005, "name": "Carlos Rodriguez", "warehouse_id": 130},
    {"marketer_id": 1006, "name": "Amanda Foster", "warehouse_id": 130},
    {"marketer_id": 1007, "name": "Kevin O'Brien", "warehouse_id": 140},
    {"marketer_id": 1008, "name": "Rachel Green", "warehouse_id": 150},
]

INDUSTRIES = [
    {"code": "CAFE", "name": "Cafes & Bakeries", "avg_value": 285.50, "conversion_rate": 0.35},
    {"code": "REST", "name": "Restaurants", "avg_value": 425.75, "conversion_rate": 0.28},
    {"code": "RETL", "name": "Retailers", "avg_value": 312.25, "conversion_rate": 0.22},
    {"code": "GROC", "name": "Grocery Stores", "avg_value": 567.80, "conversion_rate": 0.40},
    {"code": "CSTR", "name": "Construction", "avg_value": 892.45, "conversion_rate": 0.18},
    {"code": "HOTL", "name": "Hotels & Lodging", "avg_value": 756.30, "conversion_rate": 0.25},
    {"code": "OFFC", "name": "Office & Corporate", "avg_value": 445.60, "conversion_rate": 0.30},
]

LEAD_SOURCES = ["Referral", "Cold Call", "Website", "Event", "Partner"]
LEAD_STATUSES = ["New", "Contacted", "Qualified", "Proposal", "Converted", "Lost"]
SHOP_TYPES = ["Walk-in", "Online", "Phone Order"]
MEMBERSHIP_TYPES = ["Business", "Business Executive", "Gold Star Business"]

FIRST_NAMES = ["James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael", "Linda", "William", "Elizabeth",
               "David", "Barbara", "Richard", "Susan", "Joseph", "Jessica", "Thomas", "Sarah", "Charles", "Karen",
               "Christopher", "Nancy", "Daniel", "Lisa", "Matthew", "Betty", "Anthony", "Margaret", "Mark", "Sandra"]

LAST_NAMES = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez",
              "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin"]

BUSINESS_SUFFIXES = ["LLC", "Inc", "Corp", "& Sons", "Group", "Partners", "Services", "Solutions", "Enterprises"]
BUSINESS_PREFIXES = ["Golden", "Pacific", "Summit", "Premier", "Elite", "Metro", "Valley", "Coast", "Mountain", "Urban"]

def random_date(start: datetime, end: datetime) -> datetime:
    delta = end - start
    if delta.days <= 0:
        return start
    random_days = random.randint(0, delta.days)
    return start + timedelta(days=random_days)

def generate_business_name() -> str:
    patterns = [
        f"{random.choice(BUSINESS_PREFIXES)} {random.choice(['Foods', 'Catering', 'Kitchen', 'Grill', 'Cafe', 'Bakery', 'Market', 'Store'])}",
        f"{random.choice(LAST_NAMES)}'s {random.choice(['Restaurant', 'Deli', 'Shop', 'Supply', 'Mart'])}",
        f"{random.choice(FIRST_NAMES)} & {random.choice(FIRST_NAMES)} {random.choice(BUSINESS_SUFFIXES)}",
        f"The {random.choice(BUSINESS_PREFIXES)} {random.choice(['Spot', 'Place', 'Corner', 'House', 'Hub'])}",
    ]
    return random.choice(patterns)

def generate_phone() -> str:
    return f"{random.randint(200, 999)}-{random.randint(100, 999)}-{random.randint(1000, 9999)}"

def generate_email(first_name: str, last_name: str) -> str:
    domains = ["gmail.com", "yahoo.com", "outlook.com", "business.com", "company.net"]
    patterns = [
        f"{first_name.lower()}.{last_name.lower()}@{random.choice(domains)}",
        f"{first_name[0].lower()}{last_name.lower()}@{random.choice(domains)}",
        f"{first_name.lower()}{random.randint(1, 99)}@{random.choice(domains)}",
    ]
    return random.choice(patterns)

def get_fiscal_period(date: datetime) -> tuple:
    """Returns (fiscal_year, period, week) based on Costco fiscal calendar"""
    # Simplified: Costco FY starts in September
    if date.month >= 9:
        fy = date.year + 1
        period = date.month - 8
    else:
        fy = date.year
        period = date.month + 4
    
    week = (date.day - 1) // 7 + 1
    return fy, period, min(week, 4)

def generate_leads() -> List[Dict]:
    leads = []
    for i in range(NUM_LEADS):
        warehouse = random.choice(WAREHOUSES)
        warehouse_marketers = [m for m in MARKETERS if m["warehouse_id"] == warehouse["warehouse_id"]]
        marketer = random.choice(warehouse_marketers) if warehouse_marketers else random.choice(MARKETERS)
        industry = random.choice(INDUSTRIES)
        
        created_at = random_date(START_DATE, END_DATE)
        first_name = random.choice(FIRST_NAMES)
        last_name = random.choice(LAST_NAMES)
        
        # Determine status based on industry conversion rate and randomness
        rand = random.random()
        if rand < industry["conversion_rate"]:
            status = "Converted"
            conversion_days = random.randint(7, 90)
            converted_at = created_at + timedelta(days=conversion_days)
        elif rand < industry["conversion_rate"] + 0.15:
            status = "Lost"
            conversion_days = None
            converted_at = None
        else:
            status = random.choice(["New", "Contacted", "Qualified", "Proposal"])
            conversion_days = None
            converted_at = None
        
        touch_points = random.randint(1, 8) if status != "New" else 0
        
        leads.append({
            "lead_id": 10000 + i,
            "warehouse_id": warehouse["warehouse_id"],
            "marketer_id": marketer["marketer_id"],
            "industry_code": industry["code"],
            "lead_source": random.choice(LEAD_SOURCES),
            "business_name": generate_business_name(),
            "contact_name": f"{first_name} {last_name}",
            "contact_email": generate_email(first_name, last_name),
            "contact_phone": generate_phone(),
            "city": warehouse["city"],
            "state": warehouse["state"],
            "estimated_value": round(industry["avg_value"] * random.uniform(0.5, 3.0) * 12, 2),
            "touch_point_count": touch_points,
            "status": status,
            "created_at": created_at.isoformat(),
            "first_contact_at": (created_at + timedelta(days=random.randint(1, 5))).isoformat() if touch_points > 0 else None,
            "qualified_at": (created_at + timedelta(days=random.randint(10, 30))).isoformat() if status in ["Qualified", "Proposal", "Converted"] else None,
            "converted_at": converted_at.isoformat() if converted_at else None,
            "conversion_days": conversion_days,
            "created_date": created_at.date().isoformat()
        })
    
    return leads

def generate_members(leads: List[Dict]) -> List[Dict]:
    members = []
    converted_leads = [l for l in leads if l["status"] == "Converted"]
    
    # Create members from converted leads
    for i, lead in enumerate(converted_leads[:NUM_MEMBERS]):
        name_parts = lead["contact_name"].split()
        members.append({
            "member_id": 20000 + i,
            "member_number": f"11{random.randint(100000000, 999999999)}",
            "warehouse_id": lead["warehouse_id"],
            "industry_code": lead["industry_code"],
            "membership_type": random.choice(MEMBERSHIP_TYPES),
            "business_name": lead["business_name"],
            "contact_first_name": name_parts[0] if name_parts else "Unknown",
            "contact_last_name": name_parts[1] if len(name_parts) > 1 else "Unknown",
            "email": lead["contact_email"],
            "phone": lead["contact_phone"],
            "address": f"{random.randint(100, 9999)} {random.choice(['Main', 'Oak', 'Pine', 'Elm', 'Cedar'])} {random.choice(['St', 'Ave', 'Blvd', 'Rd'])}",
            "city": lead["city"],
            "state": lead["state"],
            "zip_code": f"{random.randint(10000, 99999)}",
            "lead_id": lead["lead_id"],
            "marketer_id": lead["marketer_id"],
            "joined_at": lead["converted_at"],
            "lifetime_value": 0,  # Will be calculated from sales
            "is_active": random.random() > 0.05
        })
    
    return members

def generate_sales(members: List[Dict]) -> List[Dict]:
    sales = []
    sale_id = 30000
    
    for member in members:
        if not member["is_active"]:
            continue
            
        # Generate multiple transactions per member
        num_transactions = random.randint(3, 20)
        industry = next((i for i in INDUSTRIES if i["code"] == member["industry_code"]), INDUSTRIES[0])
        
        member_joined = datetime.fromisoformat(member["joined_at"]) if member["joined_at"] else START_DATE
        
        for _ in range(num_transactions):
            sale_date = random_date(max(member_joined, START_DATE), END_DATE)
            fy, period, week = get_fiscal_period(sale_date)
            
            amount = round(industry["avg_value"] * random.uniform(0.3, 2.5), 2)
            
            sales.append({
                "sale_id": sale_id,
                "warehouse_id": member["warehouse_id"],
                "member_id": member["member_id"],
                "fiscal_year": fy,
                "fiscal_period": period,
                "fiscal_week": week,
                "sale_date": sale_date.date().isoformat(),
                "transaction_count": random.randint(1, 15),
                "amount": amount,
                "shop_type": random.choices(SHOP_TYPES, weights=[0.6, 0.25, 0.15])[0],
                "industry_code": member["industry_code"]
            })
            sale_id += 1
    
    return sales

def generate_touchpoints(leads: List[Dict]) -> List[Dict]:
    touchpoints = []
    tp_id = 40000
    
    TOUCHPOINT_TYPES = ["Call", "Email", "Meeting", "Demo", "Proposal"]
    OUTCOMES = ["Positive", "Neutral", "Negative", "No Response"]
    
    for lead in leads:
        if lead["touch_point_count"] == 0:
            continue
            
        lead_created = datetime.fromisoformat(lead["created_at"])
        
        for i in range(lead["touch_point_count"]):
            tp_date = lead_created + timedelta(days=random.randint(1, 30) * (i + 1))
            
            touchpoints.append({
                "touchpoint_id": tp_id,
                "lead_id": lead["lead_id"],
                "marketer_id": lead["marketer_id"],
                "touchpoint_type": random.choice(TOUCHPOINT_TYPES),
                "touchpoint_date": tp_date.isoformat(),
                "notes": f"Follow-up #{i+1} with {lead['contact_name']}",
                "outcome": random.choice(OUTCOMES),
                "next_action": random.choice(["Schedule call", "Send proposal", "Follow up next week", "Close deal", None])
            })
            tp_id += 1
    
    return touchpoints

def main():
    print("Generating Costco Business Center sample data...")
    
    # Generate all data
    leads = generate_leads()
    members = generate_members(leads)
    sales = generate_sales(members)
    touchpoints = generate_touchpoints(leads)
    
    # Calculate lifetime values for members
    member_sales = {}
    for sale in sales:
        mid = sale["member_id"]
        member_sales[mid] = member_sales.get(mid, 0) + sale["amount"]
    
    for member in members:
        member["lifetime_value"] = round(member_sales.get(member["member_id"], 0), 2)
    
    # Save to JSON files
    data_dir = "/home/claude/costco-poc/data"
    
    with open(f"{data_dir}/leads.json", "w") as f:
        json.dump(leads, f, indent=2)
    print(f"Generated {len(leads)} leads")
    
    with open(f"{data_dir}/members.json", "w") as f:
        json.dump(members, f, indent=2)
    print(f"Generated {len(members)} members")
    
    with open(f"{data_dir}/pos_sales.json", "w") as f:
        json.dump(sales, f, indent=2)
    print(f"Generated {len(sales)} sales transactions")
    
    with open(f"{data_dir}/touchpoints.json", "w") as f:
        json.dump(touchpoints, f, indent=2)
    print(f"Generated {len(touchpoints)} touchpoints")
    
    # Also save reference data
    with open(f"{data_dir}/warehouses.json", "w") as f:
        json.dump(WAREHOUSES, f, indent=2)
    
    with open(f"{data_dir}/marketers.json", "w") as f:
        json.dump(MARKETERS, f, indent=2)
    
    with open(f"{data_dir}/industries.json", "w") as f:
        json.dump(INDUSTRIES, f, indent=2)
    
    # Print summary statistics
    print("\n=== Data Summary ===")
    print(f"Leads by status:")
    status_counts = {}
    for lead in leads:
        status_counts[lead["status"]] = status_counts.get(lead["status"], 0) + 1
    for status, count in sorted(status_counts.items()):
        print(f"  {status}: {count}")
    
    print(f"\nSales by warehouse:")
    warehouse_sales = {}
    for sale in sales:
        wid = sale["warehouse_id"]
        warehouse_sales[wid] = warehouse_sales.get(wid, 0) + sale["amount"]
    for wid, total in sorted(warehouse_sales.items()):
        print(f"  Warehouse {wid}: ${total:,.2f}")
    
    print(f"\nTotal Revenue: ${sum(s['amount'] for s in sales):,.2f}")
    print(f"Conversion Rate: {len([l for l in leads if l['status'] == 'Converted']) / len(leads) * 100:.1f}%")
    
    print("\nData generation complete!")

if __name__ == "__main__":
    main()
