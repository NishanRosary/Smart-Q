import React from "react";
import { Search, Building2, CalendarRange, FilterX, Sparkles, Type } from "lucide-react";

const EventDiscoveryToolbar = ({
  filters,
  onFiltersChange,
  onClear,
  organizationTypes,
  eventTitles,
  filteredCount,
  totalCount
}) => {
  const handleChange = (key) => (event) => {
    onFiltersChange(key, event.target.value);
  };

  const hasActiveFilters = Boolean(
    filters.searchTerm || filters.organizationType || filters.eventTitle || filters.fromDate || filters.toDate
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
            Search by service, organization, or doctor / HR name
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
      </div>

      <div className="event-discovery-actions">
        <div className="event-discovery-note">
          Matches search against service type, organization name, and doctor / HR name.
        </div>
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
  );
};

export default EventDiscoveryToolbar;
