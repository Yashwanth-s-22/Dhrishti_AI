"""
Phase 6.4: Drishti Cascade Adapters for Log-Level Models
========================================================
Bridges candidate log-level models (Model A & Model C) to downstream Drishti
Agent interfaces without modifying existing production models or agent code.

Mathematical Transformations:
------------------------------
1. Model A (Trade Flow Value):
   Target: y_A(t+H) = ln(1 + Value_USD(t+H))
   Log Change: Delta_ln = y_hat(t+H) - ln(1 + Value_USD(t))
   Predicted Value: V_hat(t+H) = max(0.0, exp(y_hat(t+H)) - 1.0)
   Simple Percentage Return (%):
     Return_simple = ((V_hat(t+H) - Value_USD(t)) / Value_USD(t)) * 100.0
   Log Return (%):
     Return_log = Delta_ln * 100.0

2. Model C (Domestic Unit Price):
   Target: y_C(t+H) = ln(Unit_Price_USD_per_KG(t+H))
   Log Change: Delta_ln = y_hat(t+H) - ln(Unit_Price_USD_per_KG(t))
   Predicted Price: P_hat(t+H) = exp(y_hat(t+H))
   Simple Percentage Return (%):
     Return_simple = ((P_hat(t+H) - Price(t)) / Price(t)) * 100.0
   Log Return (%):
     Return_log = Delta_ln * 100.0

Safety Features:
----------------
- Rejects non-positive, zero, NaN, or infinite current values with explicit UNAVAILABLE status.
- Rejects NaN or non-finite predictions safely.
- Explicitly distinguishes 1-month and 3-month forecast horizons.
- Generates backward-compatible dictionary payloads matching downstream agent expectations
  (Trade_Return_1M_Pred, Price_Return_1M_Pred, etc.).
"""

import math
from dataclasses import dataclass, field, asdict
from typing import Dict, Any, Optional, Union


@dataclass
class CascadeAdapterResult:
    """Standardized result container for adapted model predictions."""
    model_track: str               # "Model A" or "Model C"
    forecast_horizon: str          # "1M" or "3M"
    status: str                    # "SUCCESS" or "UNAVAILABLE"
    current_observed_value: Optional[float] = None
    predicted_log_level: Optional[float] = None
    log_change: Optional[float] = None
    simple_percentage_return: Optional[float] = None  # e.g., +12.5 means +12.5%
    log_percentage_return: Optional[float] = None     # e.g., +11.8 means +11.8%
    predicted_absolute_level: Optional[float] = None  # in native units (USD or USD/kg)
    units_level: str = ""                             # "USD" or "USD/kg"
    units_return: str = "% return"
    forecast_origin: Optional[str] = None
    commodity: Optional[str] = None
    country: Optional[str] = None
    model_version: str = "Phase_6.3_LightGBM_Candidate"
    unavailability_reason: Optional[str] = None
    metadata: Dict[str, Any] = field(default_factory=dict)

    def to_cascade_payload(self) -> Dict[str, Any]:
        """Convert to downstream cascade dictionary schema."""
        if self.status != "SUCCESS":
            return {
                "status": "UNAVAILABLE",
                "unavailable_reason": self.unavailability_reason or "Adapter conversion unavailable",
                "Return_Pred": None,
                "Log_Pred": None,
                "Absolute_Pred": None,
                "Horizon": self.forecast_horizon,
            }
        
        return {
            "status": "SUCCESS",
            "Return_Pred": round(self.simple_percentage_return, 4) if self.simple_percentage_return is not None else None,
            "Log_Return_Pred": round(self.log_percentage_return, 4) if self.log_percentage_return is not None else None,
            "Log_Level_Pred": round(self.predicted_log_level, 4) if self.predicted_log_level is not None else None,
            "Absolute_Level_Pred": round(self.predicted_absolute_level, 2) if self.predicted_absolute_level is not None else None,
            "Units": self.units_level,
            "Horizon": self.forecast_horizon,
            "Model_Version": self.model_version,
            "Forecast_Origin": self.forecast_origin,
        }


def _validate_current_value(val: Any, name: str) -> Optional[str]:
    """Validate current observed value. Returns error string if invalid, None if valid."""
    if val is None:
        return f"Current observed {name} is missing (None)."
    try:
        fval = float(val)
    except (ValueError, TypeError):
        return f"Current observed {name} is non-numeric: {val}."
    if math.isnan(fval):
        return f"Current observed {name} is NaN."
    if math.isinf(fval):
        return f"Current observed {name} is infinite."
    if fval <= 0.0:
        return f"Current observed {name} must be strictly positive (> 0.0), got {fval}."
    return None


def _validate_prediction(pred: Any, name: str) -> Optional[str]:
    """Validate model log prediction. Returns error string if invalid, None if valid."""
    if pred is None:
        return f"Model prediction for {name} is missing (None)."
    try:
        fpred = float(pred)
    except (ValueError, TypeError):
        return f"Model prediction for {name} is non-numeric: {pred}."
    if math.isnan(fpred):
        return f"Model prediction for {name} is NaN."
    if math.isinf(fpred):
        return f"Model prediction for {name} is infinite."
    return None


def adapt_model_a_1m(
    current_value_usd: Union[float, int],
    predicted_log_value_1m: float,
    forecast_origin: Optional[str] = None,
    commodity: Optional[str] = None,
    country: Optional[str] = None,
    model_version: str = "Phase_6.3_LightGBM_Candidate_1M",
) -> CascadeAdapterResult:
    """
    Adapter for Model A (1-Month Ahead Log Trade Value).
    Derives simple and log percentage returns from log(1 + V) predictions.
    """
    err_curr = _validate_current_value(current_value_usd, "trade value (USD)")
    if err_curr:
        return CascadeAdapterResult(
            model_track="Model A",
            forecast_horizon="1M",
            status="UNAVAILABLE",
            unavailability_reason=err_curr,
            forecast_origin=forecast_origin,
            commodity=commodity,
            country=country,
            model_version=model_version,
            units_level="USD",
        )

    err_pred = _validate_prediction(predicted_log_value_1m, "log trade value 1M")
    if err_pred:
        return CascadeAdapterResult(
            model_track="Model A",
            forecast_horizon="1M",
            status="UNAVAILABLE",
            unavailability_reason=err_pred,
            current_observed_value=float(current_value_usd),
            forecast_origin=forecast_origin,
            commodity=commodity,
            country=country,
            model_version=model_version,
            units_level="USD",
        )

    v_curr = float(current_value_usd)
    y_pred = float(predicted_log_value_1m)

    # Invert log1p transformation: V_hat = exp(y) - 1
    # Guard against overflow if y_pred is absurdly large
    try:
        v_pred = max(0.0, math.expm1(y_pred))
    except OverflowError:
        v_pred = float("inf")

    # Log change: y_hat - ln(1 + v_curr)
    curr_log1p = math.log1p(v_curr)
    log_change = y_pred - curr_log1p

    # Simple return: ((v_pred - v_curr) / v_curr) * 100%
    if math.isinf(v_pred):
        simple_return = float("inf")
    else:
        simple_return = ((v_pred - v_curr) / v_curr) * 100.0

    log_return = log_change * 100.0

    return CascadeAdapterResult(
        model_track="Model A",
        forecast_horizon="1M",
        status="SUCCESS",
        current_observed_value=v_curr,
        predicted_log_level=y_pred,
        log_change=log_change,
        simple_percentage_return=simple_return,
        log_percentage_return=log_return,
        predicted_absolute_level=v_pred,
        units_level="USD",
        units_return="% return",
        forecast_origin=forecast_origin,
        commodity=commodity,
        country=country,
        model_version=model_version,
    )


def adapt_model_a_3m(
    current_value_usd: Union[float, int],
    predicted_log_value_3m: float,
    forecast_origin: Optional[str] = None,
    commodity: Optional[str] = None,
    country: Optional[str] = None,
    model_version: str = "Phase_6.3_LightGBM_Candidate_3M",
) -> CascadeAdapterResult:
    """
    Adapter for Model A (3-Month Ahead Log Trade Value).
    Derives simple and log percentage returns from point forecast at t+3.
    """
    err_curr = _validate_current_value(current_value_usd, "trade value (USD)")
    if err_curr:
        return CascadeAdapterResult(
            model_track="Model A",
            forecast_horizon="3M",
            status="UNAVAILABLE",
            unavailability_reason=err_curr,
            forecast_origin=forecast_origin,
            commodity=commodity,
            country=country,
            model_version=model_version,
            units_level="USD",
        )

    err_pred = _validate_prediction(predicted_log_value_3m, "log trade value 3M")
    if err_pred:
        return CascadeAdapterResult(
            model_track="Model A",
            forecast_horizon="3M",
            status="UNAVAILABLE",
            unavailability_reason=err_pred,
            current_observed_value=float(current_value_usd),
            forecast_origin=forecast_origin,
            commodity=commodity,
            country=country,
            model_version=model_version,
            units_level="USD",
        )

    v_curr = float(current_value_usd)
    y_pred = float(predicted_log_value_3m)

    try:
        v_pred = max(0.0, math.expm1(y_pred))
    except OverflowError:
        v_pred = float("inf")

    curr_log1p = math.log1p(v_curr)
    log_change = y_pred - curr_log1p

    if math.isinf(v_pred):
        simple_return = float("inf")
    else:
        simple_return = ((v_pred - v_curr) / v_curr) * 100.0

    log_return = log_change * 100.0

    return CascadeAdapterResult(
        model_track="Model A",
        forecast_horizon="3M",
        status="SUCCESS",
        current_observed_value=v_curr,
        predicted_log_level=y_pred,
        log_change=log_change,
        simple_percentage_return=simple_return,
        log_percentage_return=log_return,
        predicted_absolute_level=v_pred,
        units_level="USD",
        units_return="% return",
        forecast_origin=forecast_origin,
        commodity=commodity,
        country=country,
        model_version=model_version,
    )


def adapt_model_c_1m(
    current_price_usd_per_kg: Union[float, int],
    predicted_log_price_1m: float,
    forecast_origin: Optional[str] = None,
    commodity: Optional[str] = None,
    country: Optional[str] = None,
    model_version: str = "Phase_6.3_LightGBM_Candidate_1M",
) -> CascadeAdapterResult:
    """
    Adapter for Model C (1-Month Ahead Log Unit Price).
    Derives simple and log percentage returns from ln(Price) predictions.
    """
    err_curr = _validate_current_value(current_price_usd_per_kg, "unit price (USD/kg)")
    if err_curr:
        return CascadeAdapterResult(
            model_track="Model C",
            forecast_horizon="1M",
            status="UNAVAILABLE",
            unavailability_reason=err_curr,
            forecast_origin=forecast_origin,
            commodity=commodity,
            country=country,
            model_version=model_version,
            units_level="USD/kg",
        )

    err_pred = _validate_prediction(predicted_log_price_1m, "log unit price 1M")
    if err_pred:
        return CascadeAdapterResult(
            model_track="Model C",
            forecast_horizon="1M",
            status="UNAVAILABLE",
            unavailability_reason=err_pred,
            current_observed_value=float(current_price_usd_per_kg),
            forecast_origin=forecast_origin,
            commodity=commodity,
            country=country,
            model_version=model_version,
            units_level="USD/kg",
        )

    p_curr = float(current_price_usd_per_kg)
    y_pred = float(predicted_log_price_1m)

    try:
        p_pred = math.exp(y_pred)
    except OverflowError:
        p_pred = float("inf")

    curr_ln = math.log(p_curr)
    log_change = y_pred - curr_ln

    if math.isinf(p_pred):
        simple_return = float("inf")
    else:
        # Percentage change = ((p_pred - p_curr) / p_curr) * 100% == (exp(Delta_ln) - 1) * 100%
        simple_return = ((p_pred - p_curr) / p_curr) * 100.0

    log_return = log_change * 100.0

    return CascadeAdapterResult(
        model_track="Model C",
        forecast_horizon="1M",
        status="SUCCESS",
        current_observed_value=p_curr,
        predicted_log_level=y_pred,
        log_change=log_change,
        simple_percentage_return=simple_return,
        log_percentage_return=log_return,
        predicted_absolute_level=p_pred,
        units_level="USD/kg",
        units_return="% return",
        forecast_origin=forecast_origin,
        commodity=commodity,
        country=country,
        model_version=model_version,
    )


def adapt_model_c_3m(
    current_price_usd_per_kg: Union[float, int],
    predicted_log_price_3m: float,
    forecast_origin: Optional[str] = None,
    commodity: Optional[str] = None,
    country: Optional[str] = None,
    model_version: str = "Phase_6.3_LightGBM_Candidate_3M",
) -> CascadeAdapterResult:
    """
    Adapter for Model C (3-Month Ahead Log Unit Price).
    Derives simple and log percentage returns from point forecast at t+3.
    """
    err_curr = _validate_current_value(current_price_usd_per_kg, "unit price (USD/kg)")
    if err_curr:
        return CascadeAdapterResult(
            model_track="Model C",
            forecast_horizon="3M",
            status="UNAVAILABLE",
            unavailability_reason=err_curr,
            forecast_origin=forecast_origin,
            commodity=commodity,
            country=country,
            model_version=model_version,
            units_level="USD/kg",
        )

    err_pred = _validate_prediction(predicted_log_price_3m, "log unit price 3M")
    if err_pred:
        return CascadeAdapterResult(
            model_track="Model C",
            forecast_horizon="3M",
            status="UNAVAILABLE",
            unavailability_reason=err_pred,
            current_observed_value=float(current_price_usd_per_kg),
            forecast_origin=forecast_origin,
            commodity=commodity,
            country=country,
            model_version=model_version,
            units_level="USD/kg",
        )

    p_curr = float(current_price_usd_per_kg)
    y_pred = float(predicted_log_price_3m)

    try:
        p_pred = math.exp(y_pred)
    except OverflowError:
        p_pred = float("inf")

    curr_ln = math.log(p_curr)
    log_change = y_pred - curr_ln

    if math.isinf(p_pred):
        simple_return = float("inf")
    else:
        simple_return = ((p_pred - p_curr) / p_curr) * 100.0

    log_return = log_change * 100.0

    return CascadeAdapterResult(
        model_track="Model C",
        forecast_horizon="3M",
        status="SUCCESS",
        current_observed_value=p_curr,
        predicted_log_level=y_pred,
        log_change=log_change,
        simple_percentage_return=simple_return,
        log_percentage_return=log_return,
        predicted_absolute_level=p_pred,
        units_level="USD/kg",
        units_return="% return",
        forecast_origin=forecast_origin,
        commodity=commodity,
        country=country,
        model_version=model_version,
    )


def derive_cascade_compatible_payload(
    raw_predictions: Dict[str, Any],
    current_macro: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Constructs an agent-ready prediction dictionary fully backward-compatible
    with Drishti's orchestrator, impact interpreter, and advisory layers.
    
    Parameters:
    - raw_predictions: dict containing keys like 'log_trade_1m', 'log_trade_3m',
      'log_price_1m', 'log_price_3m', 'prod_growth', 'prod_risk', 'gva_growth', 'infl_change'
    - current_macro: dict containing 'current_trade_value_usd', 'current_price_usd_per_kg',
      'commodity', 'country', 'event_date'
    """
    c_val = current_macro.get("current_trade_value_usd")
    c_price = current_macro.get("current_price_usd_per_kg")
    origin = current_macro.get("event_date")
    comm = current_macro.get("commodity", "Commodity")
    country = current_macro.get("country", "Unknown")

    # Adapt Model A 1M & 3M
    res_a_1m = adapt_model_a_1m(c_val, raw_predictions.get("log_trade_1m"), origin, comm, country)
    res_a_3m = adapt_model_a_3m(c_val, raw_predictions.get("log_trade_3m"), origin, comm, country)

    # Adapt Model C 1M & 3M
    res_c_1m = adapt_model_c_1m(c_price, raw_predictions.get("log_price_1m"), origin, comm, country)
    res_c_3m = adapt_model_c_3m(c_price, raw_predictions.get("log_price_3m"), origin, comm, country)

    # Form downstream structure
    trade_dict = {
        "Trade_Return_1M_Pred": res_a_1m.simple_percentage_return if res_a_1m.status == "SUCCESS" else None,
        "Trade_Return_3M_Pred": res_a_3m.simple_percentage_return if res_a_3m.status == "SUCCESS" else None,
        "Log_Value_1M_Pred": res_a_1m.predicted_log_level,
        "Log_Value_3M_Pred": res_a_3m.predicted_log_level,
        "Absolute_Value_USD_1M_Pred": res_a_1m.predicted_absolute_level,
        "Absolute_Value_USD_3M_Pred": res_a_3m.predicted_absolute_level,
        "status": res_a_1m.status,
        "unavailable_reason": res_a_1m.unavailability_reason,
    }

    price_dict = {
        "Price_Return_1M_Pred": res_c_1m.simple_percentage_return if res_c_1m.status == "SUCCESS" else None,
        "Price_Return_3M_Pred": res_c_3m.simple_percentage_return if res_c_3m.status == "SUCCESS" else None,
        "Log_Price_1M_Pred": res_c_1m.predicted_log_level,
        "Log_Price_3M_Pred": res_c_3m.predicted_log_level,
        "Absolute_Price_USD_1M_Pred": res_c_1m.predicted_absolute_level,
        "Absolute_Price_USD_3M_Pred": res_c_3m.predicted_absolute_level,
        "status": res_c_1m.status,
        "unavailable_reason": res_c_1m.unavailability_reason,
    }

    agri_dict = {
        "Production_Growth_Pred": raw_predictions.get("prod_growth"),
        "Production_Risk": raw_predictions.get("prod_risk", "Low"),
        "status": "SUCCESS" if raw_predictions.get("prod_growth") is not None else "UNAVAILABLE",
    }

    econ_dict = {
        "Agri_GVA_Growth_Pred": raw_predictions.get("gva_growth"),
        "Food_Inflation_3M_Pred": raw_predictions.get("infl_change"),
        "status": "SUCCESS" if raw_predictions.get("gva_growth") is not None else "UNAVAILABLE",
    }

    return {
        "trade": trade_dict,
        "price": price_dict,
        "agriculture": agri_dict,
        "economy": econ_dict,
        "adapters_metadata": {
            "model_a_1m": asdict(res_a_1m),
            "model_a_3m": asdict(res_a_3m),
            "model_c_1m": asdict(res_c_1m),
            "model_c_3m": asdict(res_c_3m),
        }
    }
