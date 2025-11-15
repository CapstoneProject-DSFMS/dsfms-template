import React from 'react';
import { Row, Col } from 'react-bootstrap';
import { SearchBar } from '../Common';
import TemplateCardGrid from './TemplateCardGrid';
import '../../styles/template-card-scroll.css';

const TemplateListContent = ({
  templates,
  searchTerm,
  onSearchChange,
  onViewDetail
}) => {
  return (
    <>
      {/* Search and Filters */}
      <Row className="mb-3 form-mobile-stack search-filter-section">
        <Col xs={12} lg={6} md={5} className="mb-2 mb-lg-0">
          <SearchBar
            placeholder="Search templates by name, description, or creator..."
            value={searchTerm}
            onChange={onSearchChange}
            className="search-bar-mobile"
          />
        </Col>
        <Col xs={12} lg={6} md={7}>
          <div className="text-end text-mobile-center">
            <small className="text-muted">
              {templates.length} template{templates.length !== 1 ? 's' : ''}
            </small>
          </div>
        </Col>
      </Row>

      {/* Template Card Grid with Scroll */}
      <div
        className="template-card-scroll-container"
      >
        <TemplateCardGrid
          templates={templates}
          onViewDetail={onViewDetail}
        />
      </div>
    </>
  );
};

export default TemplateListContent;

