import React, { useState, useEffect } from "react";
import {
  Container,
  Card,
  Table,
  Spinner,
  Alert,
  Button,
  Row,
  Col,
  Badge,
  Collapse,
} from "react-bootstrap";
import {
  useParams,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { ROUTES } from "../../constants/routes";
import { ChevronDown, FileEarmarkPdf, ArrowLeft } from "react-bootstrap-icons";
import { assessmentAPI, templateAPI } from "../../api";
import { toast } from "react-toastify";
import { PDFModal } from "../../components/Common";

const statusDisplayMap = {
  NOT_STARTED: { variant: "secondary", text: "NOT STARTED" },
  ON_GOING: { variant: "info", text: "ON GOING" },
  APPROVED: { variant: "success", text: "APPROVED" },
  COMPLETED: { variant: "success", text: "COMPLETED" },
  PENDING: { variant: "warning", text: "PENDING" },
  DRAFT: { variant: "primary", text: "DRAFT" },
  SUBMITTED: { variant: "dark", text: "SUBMITTED" },
  CANCELLED: { variant: "danger", text: "CANCELLED" },
};

const getStatusBadge = (status) => {
  const config = statusDisplayMap[status] || {
    variant: "secondary",
    text: status || "Unknown",
  };
  return <span className={`badge bg-${config.variant}`}>{config.text}</span>;
};

const formatStatusText = (status) => {
  if (!status) return "";
  return status.replace(/_/g, " ");
};

const formatDateTime = (dateStr) => {
  if (!dateStr) return { date: "—", time: "" };
  const date = new Date(dateStr);
  return {
    date: date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }),
    time: date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }),
  };
};

const AssessmentAssignmentsPage = () => {
  const { entityType, entityId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [state, setState] = useState({
    loading: true,
    error: null,
    info: location.state || null,
    assessments: [],
    eventInfo: null,
    numberOfTrainees: 0,
    numberOfParticipatedTrainers: 0,
  });
  const [showPDFModal, setShowPDFModal] = useState(false);
  const [selectedPDFUrl, setSelectedPDFUrl] = useState(null);
  const [loadingPDF, setLoadingPDF] = useState(false);
  const [showGeneralInfo, setShowGeneralInfo] = useState(true);
  const [showRoster, setShowRoster] = useState(true);

  const isValidType = entityType === "course" || entityType === "subject";

  useEffect(() => {
    const fetchDetails = async () => {
      if (!entityId || !isValidType) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: "Invalid assessment context",
        }));
        return;
      }

      // If shouldRefresh flag is set (from navigate back), skip using location.state data
      const shouldRefresh = location.state?.shouldRefresh;

      // Check if we have data from location.state (from Access button) and not refreshing
      if (
        !shouldRefresh &&
        location.state?.assessments &&
        location.state?.eventInfo
      ) {
        setState({
          loading: false,
          error: null,
          assessments: location.state.assessments || [],
          info: {
            name:
              location.state.eventInfo?.entityInfo?.name || location.state.name,
            code:
              location.state.eventInfo?.entityInfo?.code || location.state.code,
          },
          eventInfo: location.state.eventInfo || null,
          numberOfTrainees:
            location.state.numberOfTrainees ||
            location.state.assessments?.length ||
            0,
          numberOfParticipatedTrainers:
            location.state.numberOfParticipatedTrainers || 0,
        });
        return;
      }

      // If no state data (F5 or direct navigation), use new API
      // Get templateId and occuranceDate from URL query params (set when navigating from Access button)
      // Or from location.state if navigating back from sections page
      const templateId =
        location.state?.templateId || searchParams.get("templateId");
      const occuranceDate =
        location.state?.occuranceDate || searchParams.get("occuranceDate");

      if (!templateId || !occuranceDate) {
        // Missing required params - show error message
        setState({
          loading: false,
          error:
            'Please access this page through the "Access" button from the assessment list.',
          assessments: [],
          info: location.state || null,
        });
        return;
      }

      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));

        let response;
        const requestBody = {
          courseId: entityType === "course" ? entityId : undefined,
          subjectId: entityType === "subject" ? entityId : undefined,
          templateId: templateId,
          occuranceDate: occuranceDate,
        };

        // Remove undefined properties
        Object.keys(requestBody).forEach(
          (key) => requestBody[key] === undefined && delete requestBody[key]
        );

        // Call new API with all required params
        if (entityType === "course") {
          response = await assessmentAPI.getCourseEvents(requestBody);
        } else {
          response = await assessmentAPI.getSubjectEvents(requestBody);
        }

        if (response?.assessments && response?.eventInfo) {
          setState({
            loading: false,
            error: null,
            assessments: response.assessments || [],
            info: {
              name:
                response.eventInfo?.entityInfo?.name ||
                response.eventInfo?.name,
              code: response.eventInfo?.entityInfo?.code || "",
            },
            eventInfo: response.eventInfo || null,
            numberOfTrainees:
              response.numberOfTrainees || response.assessments?.length || 0,
            numberOfParticipatedTrainers:
              response.numberOfParticipatedTrainers || 0,
          });
        } else {
          // If API doesn't return expected data structure, show empty state
          setState({
            loading: false,
            error: null,
            assessments: [],
            info: location.state || null,
            numberOfTrainees: 0,
            numberOfParticipatedTrainers: 0,
          });
        }

        // Clear shouldRefresh flag from location state after fetching
        if (shouldRefresh) {
          window.history.replaceState({}, document.title);
        }
      } catch (err) {
        console.error("Error loading assessments:", err);
        toast.error("Failed to load assessments");
        setState((prev) => ({
          ...prev,
          loading: false,
          error:
            err.response?.data?.message ||
            err.message ||
            "Failed to load assessments",
        }));
      }
    };

    fetchDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entityType, entityId, isValidType, location.key, searchParams]);

  // Cleanup PDF object URL on unmount
  useEffect(() => {
    return () => {
      if (selectedPDFUrl && selectedPDFUrl.startsWith("blob:")) {
        URL.revokeObjectURL(selectedPDFUrl);
      }
    };
  }, [selectedPDFUrl]);

  if (!isValidType) {
    return (
      <Container className="py-4">
        <Alert variant="danger">Invalid assessment type.</Alert>
      </Container>
    );
  }

  const handleAssessTrainee = (record) => {
    // Exclude these statuses: NOT_STARTED, SUBMITTED, APPROVED, CANCELLED
    const excludedStatuses = [
      "NOT_STARTED",
      "SUBMITTED",
      "APPROVED",
      "CANCELLED",
    ];
    if (excludedStatuses.includes(record.status)) return;

    // Get templateId and occuranceDate from URL params or location.state
    const templateId =
      location.state?.templateId || searchParams.get("templateId");
    const occuranceDate =
      location.state?.occuranceDate || searchParams.get("occuranceDate");

    // Navigate to sections page with return info
    navigate(ROUTES.ASSESSMENTS_SECTIONS(record.id), {
      state: {
        returnPath: location.pathname + location.search,
        entityType,
        entityId,
        templateId,
        occuranceDate,
        info: state.info,
      },
    });
  };

  const handleViewPDF = async (pdfUrl, templateId = null) => {
    try {
      setLoadingPDF(true);
      setShowPDFModal(true);

      let pdfObjectUrl = null;

      // If templateId is provided, use templateAPI to get PDF blob (preferred method)
      if (templateId) {
        try {
          const pdfBlob = await templateAPI.getTemplatePDF(templateId);
          pdfObjectUrl = URL.createObjectURL(pdfBlob);
          setSelectedPDFUrl(pdfObjectUrl);
        } catch (error) {
          console.error("Error loading PDF from template API:", error);
          // Fallback to direct URL if API fails
          if (pdfUrl) {
            // If it's a direct URL, try to fetch as blob
            try {
              const response = await fetch(pdfUrl);
              const blob = await response.blob();
              pdfObjectUrl = URL.createObjectURL(blob);
              setSelectedPDFUrl(pdfObjectUrl);
            } catch (fetchError) {
              console.error("Error fetching PDF as blob:", fetchError);
              // Last resort: use direct URL (may trigger download)
              setSelectedPDFUrl(pdfUrl);
            }
          } else {
            toast.error("Failed to load PDF");
            setShowPDFModal(false);
          }
        }
      } else if (pdfUrl) {
        // If no templateId but have URL, try to fetch as blob to prevent download
        try {
          const response = await fetch(pdfUrl, {
            method: "GET",
            headers: {
              Accept: "application/pdf",
            },
          });

          if (response.ok) {
            const blob = await response.blob();
            pdfObjectUrl = URL.createObjectURL(blob);
            setSelectedPDFUrl(pdfObjectUrl);
          } else {
            // If fetch fails, use direct URL (may trigger download)
            setSelectedPDFUrl(pdfUrl);
          }
        } catch (error) {
          console.error("Error fetching PDF as blob:", error);
          // Fallback to direct URL (may trigger download)
          setSelectedPDFUrl(pdfUrl);
        }
      } else {
        toast.error("No PDF URL available");
        setShowPDFModal(false);
      }
    } catch (error) {
      console.error("Error in handleViewPDF:", error);
      toast.error("Failed to load PDF");
      setShowPDFModal(false);
    } finally {
      setLoadingPDF(false);
    }
  };

  const handleClosePDFModal = () => {
    setShowPDFModal(false);
    // Clean up object URL to prevent memory leaks
    if (selectedPDFUrl && selectedPDFUrl.startsWith("blob:")) {
      URL.revokeObjectURL(selectedPDFUrl);
    }
    setSelectedPDFUrl(null);
    setLoadingPDF(false);
  };

  // Calculate pass/fail statistics
  const calculateStats = () => {
    const total = state.assessments.length;
    let passed = 0;
    let failed = 0;

    state.assessments.forEach((assessment) => {
      // Check if passed based on resultText only
      const resultText = String(assessment.resultText || "")
        .toUpperCase()
        .trim();
      if (resultText === "PASSED" || resultText === "PASS") {
        passed++;
      } else if (resultText === "FAILED" || resultText === "FAIL") {
        failed++;
      }
    });

    return { total, passed, failed };
  };

  const stats = calculateStats();
  const eventInfo = state.eventInfo || location.state?.eventInfo;

  return (
    <Container fluid className="py-4">
      <div className="d-flex align-items-center mb-3 flex-wrap gap-3">
        <Button
          variant="outline-secondary"
          className="d-flex align-items-center justify-content-center"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={16} className="me-2" />
          Back
        </Button>
        <div>
          <h4 className="mb-1">Assessment Event Details</h4>
        </div>
      </div>

      {/* General Information Section */}
      {!state.loading && !state.error && (
        <Card className="shadow-sm mb-4">
          <Card.Header
            className="bg-primary text-white p-3 d-flex justify-content-between align-items-center"
            style={{ cursor: "pointer" }}
            onClick={() => setShowGeneralInfo(!showGeneralInfo)}
          >
            <h5 className="mb-0">General Information</h5>
            <ChevronDown
              size={20}
              style={{
                transition: "transform 0.3s ease",
                transform: showGeneralInfo ? "rotate(0deg)" : "rotate(-90deg)",
              }}
            />
          </Card.Header>
          <Collapse
            in={showGeneralInfo}
            style={{
              transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
              maxHeight: showGeneralInfo ? "2000px" : "0px",
              overflow: "hidden",
            }}
          >
            <Card.Body>
              <Row>
                <Col md={6}>
                  <div className="mb-3">
                    <h6
                      className="mb-2 fw-bold"
                      style={{
                        color: "#064681ff",
                        backgroundColor: "#daefffff",
                        padding: "8px 12px",
                        borderRadius: "6px",
                        display: "inline-block",
                      }}
                    >
                      Event Details
                    </h6>
                    <div className="mb-2">
                      <span
                        className="fw-bold"
                        style={{ color: "#456882", fontSize: "0.95rem" }}
                      >
                        Event Name:
                      </span>{" "}
                      <span className="fw-semibold">
                        {eventInfo?.name || state.assessments[0]?.name || "—"}
                      </span>
                    </div>
                    <div className="mb-2">
                      <span
                        className="fw-bold"
                        style={{ color: "#456882", fontSize: "0.95rem" }}
                      >
                        Occurrence Date:
                      </span>{" "}
                      <span className="fw-semibold">
                        {eventInfo?.occuranceDate ||
                        eventInfo?.occurrenceDate ||
                        state.assessments[0]?.occuranceDate
                          ? formatDateTime(
                              eventInfo?.occuranceDate ||
                                eventInfo?.occurrenceDate ||
                                state.assessments[0]?.occuranceDate
                            ).date
                          : "—"}
                      </span>
                    </div>
                  <div className="mb-3 mt-3">
                    <span
                      className="fw-bold"
                      style={{ color: "#456882", fontSize: "0.95rem" }}
                    >
                      Trainers in Assessments:
                    </span>{" "}
                    <Badge bg="dark" className="px-3 py-2">
                      {state.numberOfParticipatedTrainers} Trainer{state.numberOfParticipatedTrainers !== 1 ? "s" : ""}
                    </Badge>
                  </div>
                  </div>
                </Col>
                
                <Col md={6}>
                  {/* Template Information */}
                  {eventInfo?.templateInfo && (
                    <div className="mb-3">
                      <h6
                        className="mb-2 fw-bold"
                        style={{
                          color: "#064681ff",
                          backgroundColor: "#daefffff",
                          padding: "8px 12px",
                          borderRadius: "6px",
                          display: "inline-block",
                        }}
                      >
                        Template Information
                      </h6>
                      <div className="small">
                        <div className="mb-1">
                          <span
                            className="fw-bold"
                            style={{ color: "#456882", fontSize: "0.9rem" }}
                          >
                            Template Name:
                          </span>{" "}
                          <span className="fw-medium">
                            {eventInfo.templateInfo.name || "—"}
                          </span>
                        </div>
                        {eventInfo.templateInfo.version !== null && eventInfo.templateInfo.version !== undefined && (
                          <div className="mb-1">
                            <span
                              className="fw-bold"
                              style={{ color: "#456882", fontSize: "0.9rem" }}
                            >
                              Version:
                            </span>{" "}
                            <span className="fw-medium">
                              v{eventInfo.templateInfo.version.toFixed(1)}
                            </span>
                          </div>
                        )}
                        {eventInfo.templateInfo.status && (
                          <div className="mb-1">
                            <span
                              className="fw-bold"
                              style={{ color: "#456882", fontSize: "0.9rem" }}
                            >
                              Status:
                            </span>{" "}
                            <Badge
                              bg={
                                eventInfo.templateInfo.status === "PUBLISHED"
                                  ? "success"
                                  : "secondary"
                              }
                              className="ms-1"
                            >
                              {formatStatusText(eventInfo.templateInfo.status)}
                            </Badge>
                          </div>
                        )}
                        {eventInfo.templateInfo.description && (
                          <div className="mb-1">
                            <span
                              className="fw-bold"
                              style={{ color: "#456882", fontSize: "0.9rem" }}
                            >
                              Description:
                            </span>{" "}
                            <span className="fw-medium">
                              {eventInfo.templateInfo.description}
                            </span>
                          </div>
                        )}
                        {eventInfo.templateInfo.templateContent && (
                          <div className="mb-1 mt-2">
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() =>
                                handleViewPDF(
                                  eventInfo.templateInfo.templateContent,
                                  eventInfo.templateInfo.id
                                )
                              }
                              disabled={loadingPDF}
                              className="d-inline-flex align-items-center"
                            >
                              <FileEarmarkPdf className="me-1" size={14} />
                              {loadingPDF
                                ? "Loading..."
                                : "View Template PDF"}
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </Col>
              </Row>

              {/* Course/Parent Course Information */}
              {(eventInfo?.courseInfo || eventInfo?.subjectInfo?.course) && (
                <Row className="mt-3">
                  <Col md={6}>
                    <div className="mb-3">
                      <h6
                        className="mb-2 fw-bold"
                        style={{
                          color: "#064681ff",
                          backgroundColor: "#daefffff",
                          padding: "8px 12px",
                          borderRadius: "6px",
                          display: "inline-block",
                        }}
                      >
                        {eventInfo?.subjectInfo ? "Parent Course Information" : "Course Information"}
                      </h6>
                      <div className="small">
                        <div className="mb-2">
                          <span className="fw-semibold d-block mb-1">
                            {(eventInfo.subjectInfo?.course || eventInfo.courseInfo).name || "—"}
                          </span>
                          {(eventInfo.subjectInfo?.course || eventInfo.courseInfo).code && (
                            <Badge bg="secondary" className="me-1 mb-1">
                              {(eventInfo.subjectInfo?.course || eventInfo.courseInfo).code}
                            </Badge>
                          )}
                        </div>
                        {(eventInfo.subjectInfo?.course || eventInfo.courseInfo).description && (
                          <div className="mb-2 text-muted" style={{ fontSize: "0.875rem" }}>
                            {(eventInfo.subjectInfo?.course || eventInfo.courseInfo).description}
                          </div>
                        )}
                        <div className="mb-2">
                          {(eventInfo.subjectInfo?.course || eventInfo.courseInfo).status && (
                            <Badge
                              bg={
                                (eventInfo.subjectInfo?.course || eventInfo.courseInfo).status === "ON_GOING"
                                  ? "success"
                                  : (eventInfo.subjectInfo?.course || eventInfo.courseInfo).status === "PUBLISHED"
                                  ? "success"
                                  : "secondary"
                              }
                              className="me-1"
                            >
                              {formatStatusText((eventInfo.subjectInfo?.course || eventInfo.courseInfo).status)}
                            </Badge>
                          )}
                          {(eventInfo.subjectInfo?.course || eventInfo.courseInfo).level && (
                            <Badge bg="info" className="text-dark me-1">
                              {(eventInfo.subjectInfo?.course || eventInfo.courseInfo).level}
                            </Badge>
                          )}
                        </div>
                        {(eventInfo.subjectInfo?.course || eventInfo.courseInfo).maxNumTrainee && (
                          <div className="mb-1">
                            <span
                              className="fw-bold"
                              style={{ color: "#456882", fontSize: "0.9rem" }}
                            >
                              Max Trainees:
                            </span>{" "}
                            <span className="fw-medium">
                              {(eventInfo.subjectInfo?.course || eventInfo.courseInfo).maxNumTrainee}
                            </span>
                          </div>
                        )}
                        {(eventInfo.subjectInfo?.course || eventInfo.courseInfo).venue && (
                          <div className="mb-1">
                            <span
                              className="fw-bold"
                              style={{ color: "#456882", fontSize: "0.9rem" }}
                            >
                              Venue:
                            </span>{" "}
                            <span className="fw-medium">
                              {(eventInfo.subjectInfo?.course || eventInfo.courseInfo).venue}
                            </span>
                          </div>
                        )}
                        {(eventInfo.subjectInfo?.course || eventInfo.courseInfo).note && (
                          <div className="mb-1">
                            <span
                              className="fw-bold"
                              style={{ color: "#456882", fontSize: "0.9rem" }}
                            >
                              Note:
                            </span>{" "}
                            <span className="fw-medium">
                              {(eventInfo.subjectInfo?.course || eventInfo.courseInfo).note}
                            </span>
                          </div>
                        )}
                        {((eventInfo.subjectInfo?.course || eventInfo.courseInfo).passScore !== null &&
                          (eventInfo.subjectInfo?.course || eventInfo.courseInfo).passScore !== undefined) && (
                            <div className="mb-1">
                              <span
                                className="fw-bold"
                                style={{ color: "#456882", fontSize: "0.9rem" }}
                              >
                                Pass Score:
                              </span>{" "}
                              <span className="fw-medium">
                                {(eventInfo.subjectInfo?.course || eventInfo.courseInfo).passScore}
                              </span>
                            </div>
                          )}
                        {(eventInfo.subjectInfo?.course || eventInfo.courseInfo).startDate && (
                          <div className="mb-1">
                            <span
                              className="fw-bold"
                              style={{ color: "#456882", fontSize: "0.9rem" }}
                            >
                              Start Date:
                            </span>{" "}
                            <span className="fw-medium">
                              {
                                formatDateTime((eventInfo.subjectInfo?.course || eventInfo.courseInfo).startDate)
                                  .date
                              }
                            </span>
                          </div>
                        )}
                        {(eventInfo.subjectInfo?.course || eventInfo.courseInfo).endDate && (
                          <div className="mb-1">
                            <span
                              className="fw-bold"
                              style={{ color: "#456882", fontSize: "0.9rem" }}
                            >
                              End Date:
                            </span>{" "}
                            <span className="fw-medium">
                              {
                                formatDateTime((eventInfo.subjectInfo?.course || eventInfo.courseInfo).endDate)
                                  .date
                              }
                            </span>
                          </div>
                        )}
                        {(eventInfo.subjectInfo?.course || eventInfo.courseInfo).department && (
                          <div className="mb-1">
                            <span
                              className="fw-bold"
                              style={{ color: "#456882", fontSize: "0.9rem" }}
                            >
                              Department:
                            </span>{" "}
                            <span className="fw-medium">
                              {(eventInfo.subjectInfo?.course || eventInfo.courseInfo).department.name || "—"}
                              {(eventInfo.subjectInfo?.course || eventInfo.courseInfo).department.code && (
                                <span className="text-muted ms-1">
                                  ({(eventInfo.subjectInfo?.course || eventInfo.courseInfo).department.code})
                                </span>
                              )}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Col>
                  <Col md={6}>
                    {/* Subject Information - Only show when has subject */}
                    {eventInfo?.subjectInfo && (
                      <div className="mb-3">
                        <h6
                          className="mb-2 fw-bold"
                          style={{
                            color: "#064681ff",
                            backgroundColor: "#daefffff",
                            padding: "8px 12px",
                            borderRadius: "6px",
                            display: "inline-block",
                          }}
                        >
                          Subject Information
                        </h6>
                        <div className="small">
                          <div className="mb-2">
                            <span className="fw-semibold d-block mb-1">
                              {eventInfo.subjectInfo.name || "—"}
                            </span>
                            {eventInfo.subjectInfo.code && (
                              <Badge bg="secondary" className="me-1 mb-1">
                                {eventInfo.subjectInfo.code}
                              </Badge>
                            )}
                          </div>
                          {eventInfo.subjectInfo.description && (
                            <div className="mb-2 text-muted" style={{ fontSize: "0.875rem" }}>
                              {eventInfo.subjectInfo.description}
                            </div>
                          )}
                          <div className="mb-2">
                            {eventInfo.subjectInfo.status && (
                              <Badge
                                bg={
                                  eventInfo.subjectInfo.status === "ON_GOING"
                                    ? "success"
                                    : eventInfo.subjectInfo.status === "PUBLISHED"
                                    ? "success"
                                    : "secondary"
                                }
                                className="me-1"
                              >
                                {formatStatusText(eventInfo.subjectInfo.status)}
                              </Badge>
                            )}
                            {eventInfo.subjectInfo.method && (
                              <Badge bg="info" className="me-1">
                                {eventInfo.subjectInfo.method}
                              </Badge>
                            )}
                            {eventInfo.subjectInfo.type && (
                              <Badge bg="primary" className="me-1">
                                {eventInfo.subjectInfo.type}
                              </Badge>
                            )}
                          </div>
                          {eventInfo.subjectInfo.duration && (
                            <div className="mb-1">
                              <span
                                className="fw-bold"
                                style={{ color: "#456882", fontSize: "0.9rem" }}
                              >
                                Duration:
                              </span>{" "}
                              <span className="fw-medium">
                                {eventInfo.subjectInfo.duration} 
                              </span>
                            </div>
                          )}
                          {eventInfo.subjectInfo.passScore !== null &&
                            eventInfo.subjectInfo.passScore !== undefined && (
                              <div className="mb-1">
                                <span
                                  className="fw-bold"
                                  style={{ color: "#456882", fontSize: "0.9rem" }}
                                >
                                  Pass Score:
                                </span>{" "}
                                <span className="fw-medium">
                                  {eventInfo.subjectInfo.passScore}
                                </span>
                              </div>
                            )}
                          {eventInfo.subjectInfo.startDate && (
                            <div className="mb-1">
                              <span
                                className="fw-bold"
                                style={{ color: "#456882", fontSize: "0.9rem" }}
                              >
                                Start Date:
                              </span>{" "}
                              <span className="fw-medium">
                                {formatDateTime(eventInfo.subjectInfo.startDate).date}
                              </span>
                            </div>
                          )}
                          {eventInfo.subjectInfo.endDate && (
                            <div className="mb-1">
                              <span
                                className="fw-bold"
                                style={{ color: "#456882", fontSize: "0.9rem" }}
                              >
                                End Date:
                              </span>{" "}
                              <span className="fw-medium">
                                {formatDateTime(eventInfo.subjectInfo.endDate).date}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </Col>
                </Row>
              )}

              <Row>
        
                <Col md={6}>
                  <div className="mb-3">
                    <h6
                      className="mb-2 fw-bold"
                      style={{ fontSize: "1rem", color: "#333" }}
                    >
                      Total Pass/Fail
                    </h6>
                    <div className="d-flex gap-3 flex-wrap">
                      <div>
                        <Badge bg="success" className="px-3 py-2 fs-6">
                          Passed: {stats.passed}
                        </Badge>
                      </div>
                      <div>
                        <Badge bg="danger" className="px-3 py-2 fs-6">
                          Failed: {stats.failed}
                        </Badge>
                      </div>
                      <div>
                        <Badge bg="info" className="px-3 py-2 fs-6">
                          Total: {stats.total}
                        </Badge>
                      </div>
                      {state.numberOfTrainees > 0 && (
                        <div>
                          <Badge bg="primary" className="px-3 py-2 fs-6">
                            Trainees: {state.numberOfTrainees}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Collapse>
        </Card>
      )}

      <Card className="shadow-sm mt-4">
        <Card.Header
          className="bg-primary text-white p-3 d-flex justify-content-between align-items-center"
          style={{ cursor: "pointer" }}
          onClick={() => setShowRoster(!showRoster)}
        >
          <h5 className="mb-0">Assessment Form Roster</h5>
          <ChevronDown
            size={20}
            style={{
              transition: "transform 0.3s ease",
              transform: showRoster ? "rotate(0deg)" : "rotate(-90deg)",
            }}
          />
        </Card.Header>
        <Collapse
          in={showRoster}
          style={{
            transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
            maxHeight: showRoster ? "2000px" : "0px",
            overflow: "hidden",
          }}
        >
          <Card.Body>
            {state.loading ? (
              <div className="d-flex justify-content-center align-items-center py-5">
                <Spinner animation="border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </Spinner>
              </div>
            ) : state.error ? (
              <Alert variant="danger" className="mb-0">
                {state.error}
              </Alert>
            ) : state.assessments.length === 0 ? (
              <div className="text-center py-4 text-muted">
                No Assessments Found.
              </div>
            ) : (
              <div
                className="scrollable-table-container"
                style={{ maxHeight: "70vh" }}
              >
                <Table hover responsive className="mb-0">
                  <thead>
                    <tr>
                      <th>Assessment Form</th>
                      <th>Trainee</th>
                      <th>Occurrence date</th>
                      <th>Status</th>
                      <th>Score</th>
                      <th>Result</th>
                      <th>Preview</th>
                      <th className="text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {state.assessments.map((item) => {
                      const formatted = formatDateTime(item.occuranceDate);
                      return (
                        <tr key={item.id}>
                          <td>
                            <div className="fw-semibold">{item.name}</div>
                          </td>
                          <td>
                            <div className="fw-semibold">
                              {item.trainee?.fullName || "—"}
                            </div>
                            <small className="text-muted">
                              {item.trainee?.eid || item.trainee?.email || "—"}
                            </small>
                          </td>
                          <td>
                            <div>{formatted.date}</div>
                          </td>
                          <td>{getStatusBadge(item.status)}</td>
                          <td>
                            {item.resultScore !== null &&
                            item.resultScore !== undefined
                              ? item.resultScore
                              : "—"}
                          </td>
                          <td>
                            {item.resultText ? (
                              <Badge
                                bg={
                                  item.resultText.toUpperCase() === "PASSED" ||
                                  item.resultText.toUpperCase() === "PASS"
                                    ? "success"
                                    : item.resultText.toUpperCase() === "FAILED" ||
                                    item.resultText.toUpperCase() === "FAIL"
                                    ? "danger"
                                    : "secondary"
                                }
                              >
                                {item.resultText}
                              </Badge>
                            ) : (
                              <span className="text-muted">—</span>
                            )}
                          </td>
                          <td>
                            {item.pdfUrl ? (
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => handleViewPDF(item.pdfUrl)}
                                disabled={loadingPDF}
                                className="d-flex align-items-center"
                              >
                                <FileEarmarkPdf className="me-1" size={14} />
                                {loadingPDF ? "Loading..." : "Preview"}
                              </Button>
                            ) : (
                              <span className="text-muted">—</span>
                            )}
                          </td>
                          <td className="text-center">
                            {(() => {
                              const excludedStatuses = [
                                "NOT_STARTED",
                                "SUBMITTED",
                                "APPROVED",
                                "CANCELLED",
                              ];
                              const canAssess = !excludedStatuses.includes(
                                item.status
                              );
                              return canAssess ? (
                                <Button
                                  size="sm"
                                  variant="primary"
                                  onClick={() => handleAssessTrainee(item)}
                                >
                                  View Form
                                </Button>
                              ) : (
                                <span className="text-muted">—</span>
                              );
                            })()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </div>
            )}
          </Card.Body>
        </Collapse>
      </Card>

      {/* PDF Modal */}
      <PDFModal
        show={showPDFModal}
        onHide={handleClosePDFModal}
        pdfUrl={selectedPDFUrl}
        title="Assessment PDF"
        externalLoading={loadingPDF}
      />
    </Container>
  );
};

export default AssessmentAssignmentsPage;
