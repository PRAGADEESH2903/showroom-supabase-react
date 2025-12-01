from __future__ import annotations

import os
from datetime import datetime
from typing import Any, Dict, List, Optional

from flask import Flask, jsonify, request
from flask_cors import CORS
from supabase import Client

from supabase_client import MissingSupabaseConfig, get_backend_port, get_supabase_client

app = Flask(__name__)
CORS(
    app,
    resources={
        r"/api/*": {
            "origins": ["*"],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"],
        }
    },
)

TABLE_CUSTOMERS = "customers"
TABLE_VEHICLES = "vehicles"
TABLE_PURCHASES = "purchases"
TABLE_SERVICES = "services"
TABLE_SUB_DEALERS = "sub_dealers"


def supabase_client() -> Client:
    return get_supabase_client()


def _raise_on_error(response) -> List[Dict[str, Any]]:
    if getattr(response, "error", None):
        message = getattr(response.error, "message", str(response.error))
        raise RuntimeError(message)
    return response.data or []


def _parse_date(value: Optional[str]) -> Optional[str]:
    if not value:
        return None
    try:
        return datetime.strptime(value, "%Y-%m-%d").date().isoformat()
    except ValueError as exc:
        raise ValueError(f"Invalid date format: {value}. Use YYYY-MM-DD.") from exc


def _vehicle_select() -> str:
    # Explicitly reference foreign keys so Supabase returns nested relations.
    return (
        "*,"
        " customer:customers!vehicles_customer_id_fkey(*),"
        " services(*),"
        " purchases(*)"
    )


@app.route("/")
def index():
    return jsonify(
        {
            "message": "Supabase-backed Sailakshmi Motors API",
            "database": "Supabase/Postgres",
            "frontend": "React",
            "endpoints": {
                "customers": "/api/customers",
                "vehicles": "/api/vehicles",
                "purchases": "/api/purchases",
                "services": "/api/services",
                "sub_dealers": "/api/sub-dealers",
            },
        }
    )


@app.route("/api/customers", methods=["GET"])
def list_customers():
    data = _raise_on_error(
        supabase_client()
        .table(TABLE_CUSTOMERS)
        .select("*, vehicles:vehicles(*)")
        .execute()
    )
    return jsonify(data)


@app.route("/api/customers", methods=["POST"])
def create_customer():
    payload = request.get_json(force=True)
    required = ["name", "contact", "email", "address", "city"]
    missing = [field for field in required if not payload.get(field)]
    if missing:
        return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400

    data = _raise_on_error(
        supabase_client()
        .table(TABLE_CUSTOMERS)
        .insert(
            {
                "name": payload["name"],
                "contact": payload["contact"],
                "email": payload["email"],
                "address": payload["address"],
                "city": payload["city"],
            }
        )
        .execute()
    )
    return jsonify({"message": "Customer created successfully", "customer": data[0]}), 201


@app.route("/api/vehicles", methods=["GET"])
def get_vehicles():
    vehicles = _raise_on_error(
        supabase_client().table(TABLE_VEHICLES).select(_vehicle_select()).execute()
    )

    def _format_vehicle(vehicle: Dict[str, Any]) -> Dict[str, Any]:
        customer = vehicle.get("customer") or {}
        return {
            "id": vehicle.get("id"),
            "name": vehicle.get("name"),
            "model": vehicle.get("model"),
            "engine_no": vehicle.get("engine_no"),
            "chassis_no": vehicle.get("chassis_no") or "",
            "gearbox_no": vehicle.get("gearbox_no") or "",
            "battery_no": vehicle.get("battery_no") or "",
            "tire_front": vehicle.get("tire_front") or "",
            "tire_rear_left": vehicle.get("tire_rear_left") or "",
            "tire_rear_right": vehicle.get("tire_rear_right") or "",
            "tire_stepney": vehicle.get("tire_stepney") or "",
            "year": vehicle.get("year"),
            "price": vehicle.get("price"),
            "customer_id": vehicle.get("customer_id"),
            "customer": {
                "id": customer.get("id"),
                "name": customer.get("name"),
                "contact": customer.get("contact"),
                "email": customer.get("email"),
                "address": customer.get("address"),
                "city": customer.get("city"),
            },
            "services": vehicle.get("services", []),
            "purchases": vehicle.get("purchases", []),
        }

    return jsonify([_format_vehicle(vehicle) for vehicle in vehicles])


def _ensure_customer(customer_id: int) -> Dict[str, Any]:
    response = (
        supabase_client()
        .table(TABLE_CUSTOMERS)
        .select("id, name, contact, email")
        .eq("id", customer_id)
        .limit(1)
        .execute()
    )
    rows = _raise_on_error(response)
    if not rows:
        raise ValueError("Customer not found")
    return rows[0]


def _ensure_vehicle(vehicle_id: int) -> Dict[str, Any]:
    response = (
        supabase_client()
        .table(TABLE_VEHICLES)
        .select("id, name, model")
        .eq("id", vehicle_id)
        .limit(1)
        .execute()
    )
    rows = _raise_on_error(response)
    if not rows:
        raise ValueError("Vehicle not found")
    return rows[0]


@app.route("/api/vehicles", methods=["POST"])
def create_vehicle():
    payload = request.get_json(force=True)
    try:
        customer = _ensure_customer(int(payload["customer_id"]))
    except (KeyError, ValueError):
        return jsonify({"error": "Customer not found. Please create the customer first."}), 404

    record = {
        "customer_id": customer["id"],
        "name": payload["name"],
        "model": payload["model"],
        "year": payload["year"],
        "engine_no": payload["engine_no"],
        "chassis_no": payload.get("chassis_no"),
        "gearbox_no": payload.get("gearbox_no"),
        "battery_no": payload.get("battery_no"),
        "tire_front": payload.get("tire_front"),
        "tire_rear_left": payload.get("tire_rear_left"),
        "tire_rear_right": payload.get("tire_rear_right"),
        "tire_stepney": payload.get("tire_stepney"),
        "price": payload["price"],
    }

    data = _raise_on_error(supabase_client().table(TABLE_VEHICLES).insert(record).execute())
    return jsonify({"message": "Vehicle created successfully", "vehicle": data[0], "customer": customer}), 201


@app.route("/api/purchases", methods=["POST"])
def create_purchase():
    payload = request.get_json(force=True)
    try:
        _ensure_vehicle(int(payload["vehicle_id"]))
    except (KeyError, ValueError):
        return jsonify({"error": "Vehicle not found"}), 404

    record = {
        "vehicle_id": payload["vehicle_id"],
        "payment_method": payload["payment_method"],
        "bank_name": payload.get("bank_name"),
        "loan_amount": payload.get("loan_amount"),
        "loan_tenure": payload.get("loan_tenure"),
        "interest_rate": payload.get("interest_rate"),
        "emi_amount": payload.get("emi_amount"),
        "down_payment": payload.get("down_payment"),
        "insurance_start": _parse_date(payload.get("insurance_start")),
        "insurance_end": _parse_date(payload.get("insurance_end")),
        "delivery_address": payload["delivery_address"],
        "delivery_date": _parse_date(payload.get("delivery_date")),
        "owner_name": payload["owner_name"],
        "purchase_date": _parse_date(payload.get("purchase_date")),
    }
    
    # Add dealer_id if provided
    if payload.get("dealer_id"):
        record["dealer_id"] = int(payload["dealer_id"])

    _raise_on_error(supabase_client().table(TABLE_PURCHASES).insert(record).execute())
    return jsonify({"message": "Purchase created successfully"}), 201


@app.route("/api/services", methods=["POST"])
def create_service():
    payload = request.get_json(force=True)
    try:
        _ensure_vehicle(int(payload["vehicle_id"]))
    except (KeyError, ValueError):
        return jsonify({"error": "Vehicle not found"}), 404

    service_count = int(payload["service_count"])
    service_type = "free" if service_count <= 6 else "paid"

    record = {
        "vehicle_id": payload["vehicle_id"],
        "service_count": service_count,
        "status": payload["status"],
        "service_type": service_type,
        "date": _parse_date(payload.get("date")),
    }

    _raise_on_error(supabase_client().table(TABLE_SERVICES).insert(record).execute())
    return (
        jsonify(
            {
                "message": "Service created successfully",
                "service_type": service_type,
                "service_count": service_count,
            }
        ),
        201,
    )


@app.route("/api/verify-db", methods=["GET"])
def verify_db():
    try:
        summary = {}
        for table in [TABLE_CUSTOMERS, TABLE_VEHICLES, TABLE_PURCHASES, TABLE_SERVICES, TABLE_SUB_DEALERS]:
            count_resp = (
                supabase_client()
                .table(table)
                .select("id", count="exact", head=True)
                .execute()
            )
            summary[table] = getattr(count_resp, "count", 0)
        return jsonify({"status": "success", "tables": summary})
    except Exception as exc:  # pylint: disable=broad-except
        return jsonify({"status": "error", "message": str(exc)}), 500


def _filter_entities(table: str, term: str, select_clause: str) -> List[Dict[str, Any]]:
    response = supabase_client().table(table).select(select_clause).execute()
    rows = _raise_on_error(response)
    if not term:
        return rows
    term_lower = term.lower()

    def contains(value: Any) -> bool:
        if value is None:
            return False
        return term_lower in str(value).lower()

    filtered: List[Dict[str, Any]] = []
    for row in rows:
        if any(contains(v) for v in row.values()):
            filtered.append(row)
    return filtered


@app.route("/api/customers/search", methods=["GET"])
def search_customers():
    term = request.args.get("q", "")
    data = _filter_entities(TABLE_CUSTOMERS, term, "*, vehicles:vehicles(*)")
    return jsonify(data)


@app.route("/api/vehicles/search", methods=["GET"])
def search_vehicles():
    term = request.args.get("q", "")
    data = _filter_entities(TABLE_VEHICLES, term, "*, services(*), purchases(*)")
    return jsonify(data)


@app.route("/api/services/search", methods=["GET"])
def search_services():
    term = request.args.get("q", "")
    data = _filter_entities(TABLE_SERVICES, term, "*, vehicle:vehicles(*)")
    return jsonify(data)


@app.route("/api/purchases/search", methods=["GET"])
def search_purchases():
    term = request.args.get("q", "")
    # Include dealer information using the foreign key relationship
    # Supabase PostgREST syntax: use the foreign key column name followed by the referenced table
    # Since we have dealer_id column referencing sub_dealers, the syntax is: dealer_id:sub_dealers(*)
    data = _filter_entities(TABLE_PURCHASES, term, "*, vehicle:vehicles(*), dealer_id:sub_dealers(*)")
    return jsonify(data)


@app.route("/api/customers/<int:customer_id>", methods=["GET"])
def get_customer(customer_id: int):
    response = (
        supabase_client()
        .table(TABLE_CUSTOMERS)
        .select("*")
        .eq("id", customer_id)
        .limit(1)
        .execute()
    )
    rows = _raise_on_error(response)
    if not rows:
        return jsonify({"error": "Customer not found"}), 404
    return jsonify(rows[0])


@app.route("/api/sub-dealers", methods=["GET"])
def list_sub_dealers():
    data = _raise_on_error(
        supabase_client()
        .table(TABLE_SUB_DEALERS)
        .select("*")
        .order("created_at", desc=True)
        .execute()
    )
    return jsonify(data)


@app.route("/api/sub-dealers", methods=["POST"])
def create_sub_dealer():
    payload = request.get_json(force=True)
    required = ["dealer_code", "name", "location", "contact"]
    missing = [field for field in required if not payload.get(field)]
    if missing:
        return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400

    record = {
        "dealer_code": payload["dealer_code"],
        "name": payload["name"],
        "location": payload["location"],
        "contact": payload["contact"],
    }

    data = _raise_on_error(
        supabase_client()
        .table(TABLE_SUB_DEALERS)
        .insert(record)
        .execute()
    )
    return jsonify({"message": "Sub dealer created successfully", "dealer": data[0]}), 201


@app.route("/api/sub-dealers/search", methods=["GET"])
def search_sub_dealers():
    term = request.args.get("q", "")
    data = _filter_entities(TABLE_SUB_DEALERS, term, "*")
    return jsonify(data)


if __name__ == "__main__":
    try:
        port = get_backend_port()
    except MissingSupabaseConfig as exc:
        raise SystemExit(str(exc)) from exc

    app.run(host="0.0.0.0", port=port, debug=True)

