import React from "react";
import { Search, Building2, CalendarRange, FilterX, Sparkles, Type, LocateFixed, Route } from "lucide-react";

const EventDiscoveryToolbar = ({
  filters,
  onFiltersChange,
  onClear,
  organizationTypes,
  eventTitles,
  distanceOptions,
  filteredCount,
  totalCount,
  onRequestLocation,
  locationStatus,
  hasUserLocation
}) => {
  const handleChange = (key) => (event) => {
    const nextValue = event.target.value;

    if (key === "distanceRangeKm" && nextValue && !hasUserLocation) {
      onRequestLocation?.();
      return;
    }

    onFiltersChange(key, nextValue);
  };

  const hasActiveFilters = Boolean(
    filters.searchTerm ||
      filters.organizationType ||
      filters.eventTitle ||
      filters.fromDate ||
      filters.toDate ||
      filters.distanceRangeKm
  );

  return (
    <div className="event-discovery-panel">
      <div className="event-discovery-header">
        <div>
          <div className="event-discovery-eyebrow">
            <Sparkles size={14} />
            Refine events
          </div>
          <h3 className="event-discovery-title">Find the right event faster</h3>
          <p className="event-discovery-subtitle">
            Search by service, organization, or doctor / HR name, then narrow by date and nearby distance.
          </p>
        </div>
        <div className="event-discovery-summary">
          <span className="event-discovery-count">{filteredCount}</span>
          <span className="event-discovery-count-label">of {totalCount} events shown</span>
        </div>
      </div>

      <div className="event-discovery-grid">
        <label className="event-filter-field event-filter-search">
          <span className="event-filter-label">
            <Search size={15} />
            Search events
          </span>
          <input
            type="text"
            value={filters.searchTerm}
            onChange={handleChange("searchTerm")}
            placeholder="Service type, organization, doctor or HR name"
          />
        </label>

        <label className="event-filter-field">
          <span className="event-filter-label">
            <Building2 size={15} />
            Organization type
          </span>
          <select value={filters.organizationType} onChange={handleChange("organizationType")}>
            <option value="">All organization types</option>
            {organizationTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>

        <label className="event-filter-field">
          <span className="event-filter-label">
            <Type size={15} />
            Event title
          </span>
          <select value={filters.eventTitle} onChange={handleChange("eventTitle")}>
            <option value="">All event titles</option>
            {eventTitles.map((title) => (
              <option key={title} value={title}>
                {title}
              </option>
            ))}
          </select>
        </label>

        <label className="event-filter-field">
          <span className="event-filter-label">
            <CalendarRange size={15} />
            From date
          </span>
          <input type="date" value={filters.fromDate} onChange={handleChange("fromDate")} />
        </label>

        <label className="event-filter-field">
          <span className="event-filter-label">
            <CalendarRange size={15} />
            To date
          </span>
          <input type="date" value={filters.toDate} onChange={handleChange("toDate")} />
        </label>

        <label className="event-filter-field">
          <span className="event-filter-label">
            <Route size={15} />
            Distance
          </span>
          <select value={filters.distanceRangeKm} onChange={handleChange("distanceRangeKm")}>
            {distanceOptions.map((option) => (
              <option key={option.value || "any-distance"} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="event-discovery-actions">
        <div className="event-discovery-note">
          {hasUserLocation
            ? "Location enabled. Nearby distances are now shown on each event card."
            : "Turn on location to use nearby event filtering and distance badges."}
        </div>
        <div className="event-discovery-action-group">
          <button
            type="button"
            className="btn-secondary event-location-button"
            onClick={onRequestLocation}
            disabled={locationStatus === "requesting"}
          >
            <LocateFixed size={16} />
            {locationStatus === "requesting"
              ? "Detecting..."
              : hasUserLocation
                ? "Location active"
                : "Use my location"}
          </button>
          <button
            type="button"
            className="btn-secondary event-clear-filters"
            onClick={onClear}
            disabled={!hasActiveFilters}
          >
            <FilterX size={16} />
            Clear filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventDiscoveryToolbar;
