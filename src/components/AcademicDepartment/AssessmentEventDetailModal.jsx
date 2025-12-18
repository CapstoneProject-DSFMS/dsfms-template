import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Modal,
  Button,
  Row,
  Col,
  Badge,
  Card,
  Tab,
  Nav,
  Table,
  Spinner,
  Alert,
} from "react-bootstrap";
import {
  CalendarEvent,
  X,
  People,
  Person,
  CheckCircle,
  XCircle,
  Clock,
  ClipboardCheck,
  BarChart,
  FileEarmarkPdf,
  FileText,
  Eye,
} from "react-bootstrap-icons";
import assessmentAPI from "../../api/assessment";
import templateAPI from "../../api/template";
import { toast } from "react-toastify";
import { SortIcon } from "../Common";
import useTableSort from "../../hooks/useTableSort";

// SortableHeader component (defined outside to avoid hooks issues)
const SortableHeader = ({
  columnKey,
  children,
  className = "",
  sortConfig,
  onSort,
}) => {
  const isActive = sortConfig?.key === columnKey;
  const direction = isActive ? sortConfig?.direction : null;

  return (
    <th
      className={`fw-semibold ${className}`}
      style={{
        cursor: "pointer",
        userSelect: "none",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        position: "relative",
        overflow: "hidden",
        backgroundColor: "var(--bs-primary)",
        color: "white",
        borderColor: "var(--bs-primary)",
      }}
      onClick={() => onSort(columnKey)}
      onMouseEnter={(e) => {
        e.target.style.backgroundColor = "#214760";
        e.target.style.transform = "translateY(-1px)";
        e.target.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.15)";
      }}
      onMouseLeave={(e) => {
        e.target.style.backgroundColor = "var(--bs-primary)";
        e.target.style.transform = "translateY(0)";
        e.target.style.boxShadow = "none";
      }}
    >
      <div className="d-flex align-items-center justify-content-between position-relative">
        <span
          style={{
            transition: "all 0.3s ease",
            fontWeight: isActive ? "700" : "600",
            color: "white",
            textTransform: "uppercase",
          }}
        >
          {children}
        </span>
        <div
          className="ms-2 d-flex align-items-center"
          style={{
            minWidth: "20px",
            justifyContent: "center",
          }}
        >
          <SortIcon direction={direction} size={14} color="white" />
        </div>
      </div>
      {isActive && (
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "2px",
            background: "rgba(255, 255, 255, 0.5)",
            animation: "slideIn 0.3s ease-out",
          }}
        />
      )}
    </th>
  );
};

const AssessmentEventDetailModal = ({ show, onClose, event }) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [assessments, setAssessments] = useState([]);
  const [loadingAssessments, setLoadingAssessments] = useState(false);
  const [templatePdfUrl, setTemplatePdfUrl] = useState(null);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedTraineePdf, setSelectedTraineePdf] = useState(null);
  const [traineePdfUrl, setTraineePdfUrl] = useState(null);

  const loadAssessments = useCallback(async () => {
    if (!event?.id) return;

    try {
      setLoadingAssessments(true);
      const response = await assessmentAPI.getAssessmentsByEventId(event.id);
      const assessmentsData =
        response?.data?.assessments ||
        response?.assessments ||
        response?.data ||
        [];
      setAssessments(Array.isArray(assessmentsData) ? assessmentsData : []);
    } catch {
      // If API doesn't exist or returns 404, fall back to traineeRoster
      if (event?.traineeRoster && Array.isArray(event.traineeRoster)) {
        setAssessments(event.traineeRoster);
      } else {
        setAssessments([]);
      }
    } finally {
      setLoadingAssessments(false);
    }
  }, [event?.id, event?.traineeRoster]);

  useEffect(() => {
    if (show && event?.id) {
      // Reset state when modal opens
      setActiveTab("overview");
      setTemplatePdfUrl(null);

      // Use traineeRoster from event if available, otherwise try loading via API
      if (event?.traineeRoster && Array.isArray(event.traineeRoster)) {
        setAssessments(event.traineeRoster);
        setLoadingAssessments(false);
      } else {
        // Fallback to API if traineeRoster is not available
        loadAssessments();
      }
    }
  }, [show, event?.id, event?.traineeRoster, loadAssessments]);

  useEffect(() => {
    if (activeTab === "trainees") {
      // If traineeRoster available in event, use it directly
      if (
        event?.traineeRoster &&
        Array.isArray(event.traineeRoster) &&
        assessments.length === 0
      ) {
        setAssessments(event.traineeRoster);
      }
    }
  }, [activeTab, event?.traineeRoster, assessments.length]);

  // Cleanup PDF URL on unmount
  useEffect(() => {
    return () => {
      if (templatePdfUrl) {
        URL.revokeObjectURL(templatePdfUrl);
      }
      if (traineePdfUrl) {
        URL.revokeObjectURL(traineePdfUrl);
      }
    };
  }, [templatePdfUrl, traineePdfUrl]);

  const handleTabSelect = (tab) => {
    setActiveTab(tab);

    // Load data when switching tabs
    if (tab === "trainees") {
      if (assessments.length === 0 && !loadingAssessments) {
        loadAssessments();
      }
    }
  };

  const handlePreviewTemplatePDF = async () => {
    const templateFormId = event.templateInfo?.formId || event.templateInfo?.id;

    if (!templateFormId) {
      toast.error("Template information is not available");
      return;
    }

    try {
      setLoadingPdf(true);
      setShowPreviewModal(true);

      // Get PDF without fields (using formId)
      const pdfBlob = await templateAPI.getTemplatePDF(templateFormId);

      // Create object URL for PDF
      const url = URL.createObjectURL(pdfBlob);
      setTemplatePdfUrl(url);
    } catch (error) {
      console.error("Error loading template PDF:", error);
      toast.error("Failed to load template PDF preview");
      setShowPreviewModal(false);
    } finally {
      setLoadingPdf(false);
    }
  };

  const handleCloseTemplatePreview = () => {
    setShowPreviewModal(false);
    // Clean up object URL to prevent memory leaks
    if (templatePdfUrl) {
      URL.revokeObjectURL(templatePdfUrl);
      setTemplatePdfUrl(null);
    }
  };

  // Prepare table data for trainees tab (using useMemo to avoid recreating on every render)
  // This must be BEFORE any early returns to follow React hooks rules
  const tableData = useMemo(() => {
    if (!event) return [];

    // Use traineeRoster from event API response directly
    const displayData =
      event?.traineeRoster && Array.isArray(event.traineeRoster)
        ? event.traineeRoster
        : assessments;

    // Prepare data for table sorting - always return an array
    if (!Array.isArray(displayData)) {
      return [];
    }

    return displayData.map((item, index) => {
      // Map traineeRoster fields to table display fields
      const traineeName =
        item.traineeFullName ||
        item.trainee?.fullName ||
        `${item.trainee?.firstName || ""} ${
          item.trainee?.lastName || ""
        }`.trim() ||
        `Trainee ${index + 1}`;
      const traineeEid = item.traineeEid || item.eid || "";
      const assessmentFormName =
        item.assessmentFormName || item.assessmentForm || item.name || "-";
      const status = item.status || "NOT_STARTED";
      const resultScore = item.resultScore || item.score || 0;
      const resultText = item.resultText || item.result || null;
      const occuranceDate =
        item.occuranceDate ||
        item.occurrenceDate ||
        event?.occuranceDate ||
        event?.occurrenceDate ||
        null;
      const pdfUrl = item.pdfUrl || null;

      return {
        assessmentFormId: item.assessmentFormId || index,
        id: item.assessmentFormId || index,
        assessmentForm: assessmentFormName,
        assessmentFormName: assessmentFormName,
        trainee: traineeName,
        traineeEid: traineeEid,
        traineeEmail: traineeEid,
        traineeFullName: traineeName,
        occurrenceDate: occuranceDate,
        occuranceDate: occuranceDate,
        status: status,
        score: resultScore,
        resultScore: resultScore,
        result: resultText,
        resultText: resultText,
        pdfUrl: pdfUrl,
        percentage: resultScore > 0 ? resultScore : null,
      };
    });
  }, [event, assessments]);

  // Use table sort hook at top level - always ensure tableData is an array
  // This must be BEFORE any early returns to follow React hooks rules
  const { sortedData, sortConfig, handleSort } = useTableSort(
    Array.isArray(tableData) ? tableData : []
  );

  if (!event) return null;

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const getStatusBadgeColor = (status) => {
    const statusUpper = String(status || "").toUpperCase();
    switch (statusUpper) {
      case "ACTIVE":
      case "SCHEDULED":
      case "UPCOMING":
      case "NOT_STARTED":
        return "success";
      case "COMPLETED":
      case "FINISHED":
      case "APPROVED":
        return "info";
      case "CANCELLED":
      case "CANCELED":
      case "REJECTED":
        return "danger";
      case "ONGOING":
        return "warning";
      default:
        return "secondary";
    }
  };

  const getAssessmentStatusBadge = (status) => {
    const statusUpper = String(status || "").toUpperCase();
    let variant, icon, text;

    switch (statusUpper) {
      case "COMPLETED":
      case "APPROVED":
        variant = "success";
        icon = CheckCircle;
        text = "Completed";
        break;
      case "REJECTED":
      case "FAILED":
        variant = "danger";
        icon = XCircle;
        text = "Failed";
        break;
      case "ONGOING":
        variant = "warning";
        icon = Clock;
        text = "In Progress";
        break;
      case "PENDING":
        variant = "info";
        icon = Clock;
        text = "Pending";
        break;
      case "NOT_STARTED":
        variant = "secondary";
        icon = ClipboardCheck;
        text = "Not Started";
        break;
      default:
        variant = "secondary";
        icon = ClipboardCheck;
        text = status || "Unknown";
    }

    const IconComponent = icon;
    return (
      <Badge
        bg={variant}
        className="d-flex align-items-center gap-1"
        style={{ width: "fit-content" }}
      >
        <IconComponent size={12} />
        {text}
      </Badge>
    );
  };

  // Calculate statistics - Use data from API if available
  const calculateStatistics = () => {
    // Use statistics from event data if available (from API)
    if (event.totalTrainees !== undefined) {
      return {
        total: event.totalTrainees || 0,
        passed: event.totalPassed || 0,
        failed: event.totalFailed || 0,
        inProgress: 0,
        pending: 0,
        notStarted: 0,
      };
    }
    
    // Fallback: Calculate from assessments array
    if (!assessments || assessments.length === 0) {
      return {
        total: 0,
        passed: 0,
        failed: 0,
        inProgress: 0,
        pending: 0,
        notStarted: 0,
      };
    }

    const stats = {
      total: assessments.length,
      passed: 0,
      failed: 0,
      inProgress: 0,
      pending: 0,
      notStarted: 0,
    };

    assessments.forEach((assessment) => {
      const status = String(assessment.status || "").toUpperCase();
      if (status === "COMPLETED" || status === "APPROVED") {
        // Check if passed based on resultText only
        const resultText = String(assessment.resultText || "").toUpperCase().trim();
        
        if (resultText === "PASSED" || resultText === "PASS") {
          stats.passed++;
        } else if (resultText === "FAILED" || resultText === "FAIL") {
          stats.failed++;
        }
      } else if (status === "REJECTED" || status === "FAILED") {
        stats.failed++;
      } else if (status === "ONGOING") {
        stats.inProgress++;
      } else if (status === "PENDING") {
        stats.pending++;
      } else if (status === "NOT_STARTED") {
        stats.notStarted++;
      }
    });

    return stats;
  };

  const entityType = event.entityInfo?.type || "-";
  const entityName = event.entityInfo?.name || "-";
  const entityCode = event.entityInfo?.code || "-";
  const templateName = event.templateInfo?.name || "-";
  const templateFormId = event.templateInfo?.formId || event.templateInfo?.id;

  // Check if there's subject info
  const hasSubject = entityType === "subject";
  const subjectInfo = hasSubject ? event.entityInfo : null;
  // For subjects, check if there's course info nested in subject
  // For courses, use entityInfo directly
  const courseInfo = hasSubject
    ? event.entityInfo?.course || null
    : entityType === "course"
    ? event.entityInfo
    : null;

  const stats = calculateStatistics();

  return (
    <Modal
      show={show}
      onHide={onClose}
      size="xl"
      centered
      dialogClassName="assessment-event-detail-modal"
      onShow={() => {
        document.body.style.overflow = "hidden";
      }}
      onExited={() => {
        document.body.style.overflow = "auto";
      }}
    >
      <Modal.Header
        className="bg-primary-custom text-white border-0"
        style={{
          borderTopLeftRadius: "0.5rem",
          borderTopRightRadius: "0.5rem",
        }}
      >
        <Modal.Title className="d-flex align-items-center text-white mb-0">
          <CalendarEvent className="me-2" size={20} />
          Assessment Event Details
        </Modal.Title>
        <Button
          variant="link"
          onClick={onClose}
          className="text-white p-0 ms-auto"
          style={{
            border: "none",
            background: "none",
            opacity: 0.9,
          }}
        >
          <X size={24} color="#ffffff" />
        </Button>
      </Modal.Header>

      <Modal.Body
        className="p-0 assessment-event-modal-body"
        style={{
          maxHeight: "70vh",
          height: "70vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#f8f9fa",
        }}
      >
        <Tab.Container activeKey={activeTab} onSelect={handleTabSelect}>
          <Nav
            variant="tabs"
            className="border-bottom bg-white px-3"
            style={{ margin: 0, flexShrink: 0 }}
          >
            <Nav.Item>
              <Nav.Link
                eventKey="overview"
                className={activeTab === "overview" ? "active" : ""}
                style={{
                  color:
                    activeTab === "overview" ? "var(--bs-primary)" : "#6c757d",
                  borderBottom:
                    activeTab === "overview"
                      ? "2px solid var(--bs-primary)"
                      : "none",
                  fontWeight: activeTab === "overview" ? 600 : 400,
                }}
              >
                <FileText className="me-2" size={16} />
                Overview
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link
                eventKey="trainees"
                className={activeTab === "trainees" ? "active" : ""}
                style={{
                  color:
                    activeTab === "trainees" ? "var(--bs-primary)" : "#6c757d",
                  borderBottom:
                    activeTab === "trainees"
                      ? "2px solid var(--bs-primary)"
                      : "none",
                  fontWeight: activeTab === "trainees" ? 600 : 400,
                }}
              >
                <People className="me-2" size={16} />
                Trainee Roster
              </Nav.Link>
            </Nav.Item>
          </Nav>

          <Tab.Content
            style={{
              flex: 1,
              overflow: "hidden",
              padding: 0,
              minHeight: 0,
              height: "100%",
              display: "flex",
              flexDirection: "column",
              margin: 0,
              position: "relative",
            }}
          >
            {/* Overview Tab */}
            <Tab.Pane
              eventKey="overview"
              style={{
                height: activeTab === "overview" ? "100%" : "0",
                minHeight: activeTab === "overview" ? "100%" : "0",
                display: activeTab === "overview" ? "flex" : "none",
                flexDirection: "column",
                margin: 0,
                padding: 0,
                overflow: "hidden",
                position: "relative",
                flex: activeTab === "overview" ? 1 : 0,
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1.5rem",
                  flex: 1,
                  padding: "1.5rem",
                  overflowY: "auto",
                  minHeight: 0,
                  margin: 0,
                  width: "100%",
                }}
              >
                {/* General Information Card */}
                <Card
                  className="shadow-sm"
                  style={{
                    borderColor: "var(--bs-neutral-200)",
                    marginBottom: 0,
                  }}
                >
                  <Card.Header
                    className="bg-primary-custom text-white d-flex align-items-center"
                    style={{
                      backgroundColor: "var(--bs-primary)",
                      borderBottom: "none",
                    }}
                  >
                    <FileText className="me-2" size={18} />
                    <span className="fw-semibold">General Information</span>
                  </Card.Header>
                  <Card.Body
                    className="p-4"
                    style={{ backgroundColor: "#ffffff" }}
                  >
                    <Row className="g-4">
                      <Col md={6}>
                        {/* Event Information */}
                        <div className="mb-3">
                          <h6
                            className="mb-3 fw-bold"
                            style={{
                              fontSize: "1rem",
                              color: "#153a4a",
                              textTransform: "uppercase",
                              letterSpacing: "0.5px",
                            }}
                          >
                            Event Information
                          </h6>
                          <div className="mb-2 d-flex align-items-start assessment-info-row">
                            <small
                              className="text-muted assessment-label"
                              style={{ minWidth: "200px", fontWeight: 500 }}
                            >
                              Event Name:
                            </small>
                            <span
                              className="fw-semibold ms-2 assessment-value"
                              style={{ color: "var(--bs-dark)" }}
                            >
                              {event.name || "-"}
                            </span>
                          </div>
                          <div className="mb-2 d-flex align-items-start assessment-info-row">
                            <small
                              className="text-muted assessment-label"
                              style={{ minWidth: "200px", fontWeight: 500 }}
                            >
                              Occurrence Date:
                            </small>
                            <span
                              className="ms-2 assessment-value"
                              style={{ color: "var(--bs-dark)" }}
                            >
                              {formatDate(
                                event.occuranceDate || event.occurrenceDate
                              )}
                            </span>
                          </div>
                          <div className="mb-2 d-flex align-items-center assessment-info-row">
                            <small
                              className="text-muted assessment-label"
                              style={{ minWidth: "200px", fontWeight: 500 }}
                            >
                              Event Status:
                            </small>
                            <Badge
                              bg={getStatusBadgeColor(event.status)}
                              className="ms-2 px-3 py-1 assessment-value"
                            >
                              {event.status || "-"}
                            </Badge>
                          </div>
                          <div className="mb-2 d-flex align-items-start assessment-info-row">
                            <small
                              className="text-muted assessment-label"
                              style={{ minWidth: "200px", fontWeight: 500 }}
                            >
                              Total Trainees In Assessments:
                            </small>
                            <span
                              className="fw-semibold ms-2 assessment-value"
                              style={{ color: "var(--bs-dark)" }}
                            >
                              {event.totalTrainees || 0} Trainees
                            </span>
                          </div>
                        </div>

                        {/* Course Information - Only show if entityType is 'course' */}
                        {entityType === "course" && courseInfo && (
                          <div className="mb-3">
                            <h6
                              className="mb-3 fw-bold"
                              style={{
                                fontSize: "1rem",
                                color: "#153a4a",
                                textTransform: "uppercase",
                                letterSpacing: "0.5px",
                              }}
                            >
                              Course Information
                            </h6>
                            <div className="mb-2 d-flex align-items-start assessment-info-row">
                              <small
                                className="text-muted assessment-label"
                                style={{ minWidth: "200px", fontWeight: 500 }}
                              >
                                Course Name:
                              </small>
                              <span
                                className="fw-semibold ms-2 assessment-value"
                                style={{ color: "var(--bs-dark)" }}
                              >
                                {courseInfo.name || entityName || "-"}
                              </span>
                            </div>
                            <div className="mb-2 d-flex align-items-center assessment-info-row">
                              <small
                                className="text-muted assessment-label"
                                style={{ minWidth: "200px", fontWeight: 500 }}
                              >
                                Course Code:
                              </small>
                              <Badge
                                bg="secondary"
                                className="ms-2 px-2 py-1 assessment-value"
                              >
                                {courseInfo.code || entityCode || "-"}
                              </Badge>
                            </div>
                          </div>
                        )}
                      </Col>
                      <Col md={6}>
                        {/* Subject Information */}
                        {hasSubject && subjectInfo && (
                          <div className="mb-3">
                            <h6
                              className="mb-3 fw-bold"
                              style={{
                                fontSize: "1rem",
                                color: "#153a4a",
                                textTransform: "uppercase",
                                letterSpacing: "0.5px",
                              }}
                            >
                              Subject Information
                            </h6>
                            <div className="mb-2 d-flex align-items-start assessment-info-row">
                              <small
                                className="text-muted assessment-label"
                                style={{ minWidth: "200px", fontWeight: 500 }}
                              >
                                Subject Name:
                              </small>
                              <span
                                className="fw-semibold ms-2 assessment-value"
                                style={{ color: "var(--bs-dark)" }}
                              >
                                {subjectInfo.name || entityName || "-"}
                              </span>
                            </div>
                            <div className="mb-2 d-flex align-items-center assessment-info-row">
                              <small
                                className="text-muted assessment-label"
                                style={{ minWidth: "200px", fontWeight: 500 }}
                              >
                                Subject Code:
                              </small>
                              <Badge
                                bg="info"
                                className="ms-2 px-2 py-1 assessment-value"
                              >
                                {subjectInfo.code || entityCode || "-"}
                              </Badge>
                            </div>
                            {subjectInfo.course && (
                              <div className="mt-3">
                                <h6
                                  className="mb-3 fw-bold"
                                  style={{
                                    fontSize: "1rem",
                                    color: "#153a4a",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.5px",
                                  }}
                                >
                                  Course Information
                                </h6>
                                <div className="mb-2 d-flex align-items-start assessment-info-row">
                                  <small
                                    className="text-muted assessment-label"
                                    style={{
                                      minWidth: "200px",
                                      fontWeight: 500,
                                    }}
                                  >
                                    Course Name:
                                  </small>
                                  <span
                                    className="fw-semibold ms-2 assessment-value"
                                    style={{ color: "var(--bs-dark)" }}
                                  >
                                    {subjectInfo.course.name || "-"}
                                  </span>
                                </div>
                                <div className="mb-2 d-flex align-items-center assessment-info-row">
                                  <small
                                    className="text-muted assessment-label"
                                    style={{
                                      minWidth: "200px",
                                      fontWeight: 500,
                                    }}
                                  >
                                    Course Code:
                                  </small>
                                  <Badge
                                    bg="secondary"
                                    className="ms-2 px-2 py-1 assessment-value"
                                  >
                                    {subjectInfo.course.code || "-"}
                                  </Badge>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Assessment Instrument (Template) Information */}
                        <div className="mb-3">
                          <h6
                            className="mb-3 fw-bold"
                            style={{
                              fontSize: "1rem",
                              color: "#153a4a",
                              textTransform: "uppercase",
                              letterSpacing: "0.5px",
                            }}
                          >
                            Assessment Instrument (Template) Information
                          </h6>
                          <div className="mb-2 d-flex align-items-start assessment-info-row">
                            <small
                              className="text-muted assessment-label"
                              style={{ minWidth: "200px", fontWeight: 500 }}
                            >
                              Template Name:
                            </small>
                            <span
                              className="fw-semibold ms-2 assessment-value"
                              style={{
                                color: "var(--bs-dark)",
                                wordBreak: "break-word",
                              }}
                            >
                              {templateName}
                            </span>
                          </div>
                          <div className="mb-2 d-flex align-items-center assessment-info-row">
                            <small
                              className="text-muted assessment-label"
                              style={{ minWidth: "200px", fontWeight: 500 }}
                            >
                              Template Preview:
                            </small>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={handlePreviewTemplatePDF}
                              className="ms-2 d-inline-flex align-items-center assessment-value"
                              disabled={!templateFormId}
                            >
                              <FileEarmarkPdf className="me-1" size={14} />
                              Show PDF
                            </Button>
                          </div>
                        </div>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>

                {/* Statistics Card */}
                <Card
                  className="shadow-sm"
                  style={{
                    borderColor: "var(--bs-neutral-200)",
                    marginBottom: 0,
                  }}
                >
                  <Card.Header
                    className="bg-primary-custom text-white d-flex align-items-center"
                    style={{
                      backgroundColor: "var(--bs-primary)",
                      borderBottom: "none",
                    }}
                  >
                    <BarChart className="me-2" size={18} />
                    <span className="fw-semibold">Statistics</span>
                  </Card.Header>
                  <Card.Body
                    className="p-3"
                    style={{ backgroundColor: "#ffffff" }}
                  >
                    {loadingAssessments ? (
                      <div className="d-flex justify-content-center align-items-center py-3">
                        <Spinner
                          animation="border"
                          variant="primary"
                          size="sm"
                        />
                        <span className="ms-2 text-muted">
                          Loading statistics...
                        </span>
                      </div>
                    ) : (
                      <>
                        <Row className="g-3 mb-4">
                          <Col md={4} className="mb-3">
                            <Card
                              className="h-100 border-success shadow-sm"
                              style={{
                                transition: "all 0.3s ease",
                                cursor: "pointer",
                                backgroundColor: "#d4edda", // Solid success background
                                border: "2px solid var(--bs-success)",
                                position: "relative",
                                overflow: "hidden",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.transform =
                                  "translateY(-8px) scale(1.05)";
                                e.currentTarget.style.boxShadow =
                                  "0 12px 30px rgba(40, 167, 69, 0.4)";
                                e.currentTarget.style.borderColor = "#28a745";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.transform =
                                  "translateY(0) scale(1)";
                                e.currentTarget.style.boxShadow =
                                  "0 4px 12px rgba(0,0,0,0.1)";
                                e.currentTarget.style.borderColor =
                                  "var(--bs-success)";
                              }}
                            >
                              <Card.Body className="text-center position-relative">
                                <div
                                  className="mb-2"
                                  style={{
                                    fontSize: "3rem",
                                    fontWeight: "bold",
                                    color: "#155724",
                                    textShadow: "0 2px 4px rgba(0,0,0,0.1)",
                                    animation: "pulse 2s infinite",
                                  }}
                                >
                                  {stats.passed}
                                </div>
                                <p
                                  className="text-muted mb-0 fw-semibold"
                                  style={{ fontSize: "1rem" }}
                                >
                                  Passed
                                </p>
                              </Card.Body>
                            </Card>
                          </Col>
                          <Col md={4} className="mb-3">
                            <Card
                              className="h-100 border-danger shadow-sm"
                              style={{
                                transition: "all 0.3s ease",
                                cursor: "pointer",
                                backgroundColor: "#f8d7da", // Solid danger background
                                border: "2px solid var(--bs-danger)",
                                position: "relative",
                                overflow: "hidden",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.transform =
                                  "translateY(-8px) scale(1.05)";
                                e.currentTarget.style.boxShadow =
                                  "0 12px 30px rgba(220, 53, 69, 0.4)";
                                e.currentTarget.style.borderColor = "#dc3545";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.transform =
                                  "translateY(0) scale(1)";
                                e.currentTarget.style.boxShadow =
                                  "0 4px 12px rgba(0,0,0,0.1)";
                                e.currentTarget.style.borderColor =
                                  "var(--bs-danger)";
                              }}
                            >
                              <Card.Body className="text-center position-relative">
                                <div
                                  className="mb-2"
                                  style={{
                                    fontSize: "3rem",
                                    fontWeight: "bold",
                                    color: "#721c24",
                                    textShadow: "0 2px 4px rgba(0,0,0,0.1)",
                                    animation: "pulse 2s infinite",
                                  }}
                                >
                                  {stats.failed}
                                </div>
                                <p
                                  className="text-muted mb-0 fw-semibold"
                                  style={{ fontSize: "1rem" }}
                                >
                                  Failed
                                </p>
                              </Card.Body>
                            </Card>
                          </Col>
                          <Col md={4} className="mb-3">
                            <Card
                              className="h-100 border-primary shadow-sm"
                              style={{
                                transition: "all 0.3s ease",
                                cursor: "pointer",
                                backgroundColor: "#ccedffff", // Solid primary background
                                border: "2px solid var(--bs-primary)",
                                position: "relative",
                                overflow: "hidden",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.transform =
                                  "translateY(-8px) scale(1.05)";
                                e.currentTarget.style.boxShadow =
                                  "0 12px 30px rgba(0, 123, 255, 0.4)";
                                e.currentTarget.style.borderColor = "#007bff";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.transform =
                                  "translateY(0) scale(1)";
                                e.currentTarget.style.boxShadow =
                                  "0 4px 12px rgba(0,0,0,0.1)";
                                e.currentTarget.style.borderColor =
                                  "var(--bs-primary)";
                              }}
                            >
                              <Card.Body className="text-center position-relative">
                                <div
                                  className="mb-2"
                                  style={{
                                    fontSize: "3rem",
                                    fontWeight: "bold",
                                    color: "#04234fff",
                                    textShadow: "0 2px 4px rgba(0,0,0,0.1)",
                                    animation: "pulse 2s infinite",
                                  }}
                                >
                                  {stats.total}
                                </div>
                                <p
                                  className="text-muted mb-0 fw-semibold"
                                  style={{ fontSize: "1rem" }}
                                >
                                  Total Forms
                                </p>
                              </Card.Body>
                            </Card>
                          </Col>
                        </Row>

                        {stats.total > 0 && (
                          <div className="mt-4">
                            <h6 className="mb-3">Pass Rate: </h6>
                            <div
                              className="progress"
                            >
                              <div
                                className="progress-bar bg-success"
                                role="progressbar"
                                style={{
                                  width: `${
                                    stats.total > 0
                                      ? (stats.passed / stats.total) * 100
                                      : 0
                                  }%`,
                                }}
                                aria-valuenow={stats.passed}
                                aria-valuemin={0}
                                aria-valuemax={stats.total}
                              >
                                {stats.total > 0
                                  ? Math.round(
                                      (stats.passed / stats.total) * 100
                                    )
                                  : 0}
                                %
                              </div>
                            </div>
                            <small className="text-muted mt-2 d-block">
                              {stats.passed} out of {stats.total} trainees
                              passed (
                              {stats.total > 0
                                ? Math.round((stats.passed / stats.total) * 100)
                                : 0}
                              %)
                            </small>
                          </div>
                        )}
                      </>
                    )}
                  </Card.Body>
                </Card>
              </div>
            </Tab.Pane>

            {/* Trainees & Results Tab */}
            <Tab.Pane
              eventKey="trainees"
              style={{
                height: activeTab === "trainees" ? "100%" : "0",
                minHeight: activeTab === "trainees" ? "100%" : "0",
                display: activeTab === "trainees" ? "flex" : "none",
                flexDirection: "column",
                margin: 0,
                padding: 0,
                overflow: "hidden",
                position: "relative",
                flex: activeTab === "trainees" ? 1 : 0,
                alignItems: "flex-start",
                justifyContent: "flex-start",
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  flex: "1 1 auto",
                  overflowY: "auto",
                  overflowX: "auto",
                  minHeight: 0,
                  padding: "1.5rem",
                  margin: 0,
                  maxHeight: "none",
                  border: "none",
                  borderRadius: 0,
                  position: "relative",
                  WebkitOverflowScrolling: "touch",
                  alignSelf: "stretch",
                }}
              >
                <Table
                  hover
                  className="mb-0 table-mobile-responsive"
                  style={{ fontSize: "0.875rem", marginTop: 0 }}
                >
                  <thead className="sticky-header">
                    <tr>
                      <SortableHeader
                        columnKey="assessmentForm"
                        sortConfig={sortConfig}
                        onSort={handleSort}
                      >
                        Assessment Form
                      </SortableHeader>
                      <SortableHeader
                        columnKey="trainee"
                        sortConfig={sortConfig}
                        onSort={handleSort}
                      >
                        Trainee
                      </SortableHeader>
                      <SortableHeader
                        columnKey="occurrenceDate"
                        sortConfig={sortConfig}
                        onSort={handleSort}
                      >
                        Occurrence Date
                      </SortableHeader>
                      <SortableHeader
                        columnKey="status"
                        sortConfig={sortConfig}
                        onSort={handleSort}
                      >
                        Status
                      </SortableHeader>
                      <SortableHeader
                        columnKey="score"
                        sortConfig={sortConfig}
                        onSort={handleSort}
                      >
                        Score
                      </SortableHeader>
                      <SortableHeader
                        columnKey="result"
                        sortConfig={sortConfig}
                        onSort={handleSort}
                      >
                        Result
                      </SortableHeader>
                      <th
                        className="fw-semibold text-center"
                        style={{
                          backgroundColor: "var(--bs-primary)",
                          color: "white",
                          borderColor: "var(--bs-primary)",
                        }}
                      >
                        Preview
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedData.map((item, index) => {
                      const hasPdf =
                        item.pdfUrl !== null && item.pdfUrl !== undefined;

                      // Support both assessment format and traineeRoster format from API
                      const assessmentFormName =
                        item.assessmentFormName || item.assessmentForm || "-";
                      const traineeName =
                        item.traineeFullName || item.trainee || "-";
                      const traineeEid =
                        item.traineeEid || item.traineeEmail || "";
                      const occuranceDate =
                        item.occuranceDate || item.occurrenceDate;
                      const status = item.status || "-";
                      const resultScore = item.resultScore || item.score;
                      const resultText = item.resultText || item.result;

                      return (
                        <tr
                          key={item.id || item.assessmentFormId || index}
                          className={`${
                            index % 2 === 0 ? "bg-white" : "bg-neutral-50"
                          } transition-all`}
                          style={{
                            transition: "background-color 0.2s ease",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor =
                              "var(--bs-neutral-100)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor =
                              index % 2 === 0
                                ? "white"
                                : "var(--bs-neutral-50)";
                          }}
                        >
                          <td className="align-middle">
                            <span className="fw-medium">
                              {assessmentFormName}
                            </span>
                          </td>
                          <td className="align-middle">
                            <div className="d-flex align-items-center">
                              <Person className="me-2 text-primary" size={18} />
                              <div>
                                <h6 className="mb-0 fw-medium">
                                  {traineeName}
                                </h6>
                                {traineeEid && (
                                  <small className="text-muted">
                                    {traineeEid}
                                  </small>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="align-middle">
                            <span>{formatDate(occuranceDate)}</span>
                          </td>
                          <td className="align-middle">
                            {getAssessmentStatusBadge(status)}
                          </td>
                          <td className="align-middle">
                            {resultScore !== null &&
                            resultScore !== undefined ? (
                              <span className="fw-bold text-primary">
                                {resultScore}
                              </span>
                            ) : (
                              <span className="text-muted">-</span>
                            )}
                          </td>
                          <td className="align-middle">
                            {resultText ? (
                              <Badge
                                bg={
                                  resultText.toUpperCase() === "PASSED" ||
                                  resultText.toUpperCase() === "PASS"
                                    ? "success"
                                    : resultText.toUpperCase() === "FAILED" ||
                                    resultText.toUpperCase() === "FAIL"
                                    ? "danger"
                                    : "secondary"
                                }
                              >
                                {resultText}
                              </Badge>
                            ) : (
                              <span className="text-muted">-</span>
                            )}
                          </td>
                          <td className="align-middle text-center">
                            {hasPdf && (
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => {
                                  setSelectedTraineePdf(item);
                                  setTraineePdfUrl(item.pdfUrl);
                                }}
                                className="d-inline-flex align-items-center"
                              >
                                <FileEarmarkPdf className="me-1" size={14} />
                                Preview
                              </Button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </div>
            </Tab.Pane>
          </Tab.Content>
        </Tab.Container>
      </Modal.Body>

      <Modal.Footer className="border-top">
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      </Modal.Footer>

      {/* Template PDF Preview Modal */}
      <Modal
        show={showPreviewModal}
        onHide={handleCloseTemplatePreview}
        size="xl"
        centered
        onShow={() => {
          document.body.style.overflow = "hidden";
        }}
        onExited={() => {
          document.body.style.overflow = "auto";
        }}
      >
        <Modal.Header
          closeButton
          style={{
            flexShrink: 0,
            backgroundColor: "var(--bs-primary)",
            borderColor: "var(--bs-primary)",
          }}
        >
          <Modal.Title style={{ color: "white" }}>
            Template Preview - {templateName}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body
          style={{
            padding: 0,
            height: "70vh",
            maxHeight: "600px",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {loadingPdf ? (
            <div
              className="d-flex justify-content-center align-items-center"
              style={{ minHeight: "400px" }}
            >
              <Spinner animation="border" variant="primary" />
              <span className="ms-3">Loading PDF preview...</span>
            </div>
          ) : templatePdfUrl ? (
            <div
              style={{
                border: "1px solid #dee2e6",
                borderRadius: "0.375rem",
                overflow: "auto",
                height: "100%",
                width: "100%",
                flex: 1,
              }}
            >
              <iframe
                src={templatePdfUrl + "#toolbar=0"}
                width="100%"
                height="100%"
                style={{
                  border: "none",
                  minHeight: "100%",
                  display: "block",
                }}
                title="Template PDF Preview"
              />
            </div>
          ) : (
            <Alert variant="danger" className="m-3 mb-0">
              <FileEarmarkPdf className="me-2" />
              Failed to load PDF preview. Please try again.
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer style={{ flexShrink: 0 }}>
          <Button variant="secondary" onClick={handleCloseTemplatePreview}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Trainee PDF Viewer Modal */}
      <Modal
        show={!!selectedTraineePdf}
        onHide={() => {
          setSelectedTraineePdf(null);
          setTraineePdfUrl(null);
        }}
        size="xl"
        centered
        dialogClassName="trainee-pdf-modal"
        style={{
          overflow: "hidden",
        }}
        contentClassName="trainee-pdf-modal-content"
        onShow={() => {
          document.body.style.overflow = "hidden";
        }}
        onExited={() => {
          document.body.style.overflow = "auto";
        }}
      >
        <Modal.Header closeButton style={{ flexShrink: 0 }}>
          <Modal.Title>
            Assessment PDF -{" "}
            {selectedTraineePdf?.trainee?.fullName || "Trainee"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body
          style={{
            padding: 0,
            height: "70vh",
            maxHeight: "600px",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {traineePdfUrl && (
            <div
              style={{
                border: "1px solid #dee2e6",
                borderRadius: "0.375rem",
                overflow: "auto",
                height: "100%",
                width: "100%",
                flex: 1,
              }}
            >
              <iframe
                src={traineePdfUrl}
                width="100%"
                height="100%"
                style={{
                  border: "none",
                  minHeight: "100%",
                  display: "block",
                }}
                title="Trainee Assessment PDF"
              />
            </div>
          )}
        </Modal.Body>
        <Modal.Footer style={{ flexShrink: 0 }}>
          <Button
            variant="secondary"
            onClick={() => {
              setSelectedTraineePdf(null);
              setTraineePdfUrl(null);
            }}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Modal>
  );
};

export default AssessmentEventDetailModal;
