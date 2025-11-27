import React, { useState, useEffect, useRef, useMemo } from "react";
import { Nav, Button } from "react-bootstrap";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  House,
  People,
  Shield,
  Building,
  FileText,
  Airplane,
  ChevronLeft,
  ChevronRight,
  Gear,
  X,
  ChevronDown,
  ChevronRight as ChevronRightIcon,
  PersonCheck,
  ExclamationTriangle,
  ChatDots,
  FileEarmarkText,
  CalendarEvent,
  CheckCircle,
  Book,
  ClipboardCheck,
  Clock,
  List,
} from "react-bootstrap-icons";
import logo from "../../assets/logo-light.png";
import { usePermissions } from "../../hooks/usePermissions";
import { useAuth } from "../../hooks/useAuth";
import useDepartmentManagement from "../../hooks/useDepartmentManagement";
import { ROUTES } from "../../constants/routes";
import { getAccessibleNavItems, isAcademicDepartment } from "../../utils/sidebarUtils";
import { PERMISSION_IDS } from "../../constants/permissionIds";

const Sidebar = ({ collapsed, onClose }) => {
  const { hasPermission } = usePermissions();
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const isAcademicDept = useMemo(
    () => isAcademicDepartment(user),
    [user]
  );

  const hasAcademicDeptPermission = useMemo(
    () => hasPermission(PERMISSION_IDS.VIEW_ALL_DEPARTMENTS) && !hasPermission(PERMISSION_IDS.UPDATE_DEPARTMENT),
    [hasPermission]
  );
  
  const { departments, loading: departmentsLoading } = useDepartmentManagement(
    hasAcademicDeptPermission
  );
  const [isDepartmentDropdownOpen, setIsDepartmentDropdownOpen] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [isScrollable, setIsScrollable] = useState(false);
  const dropdownRef = useRef(null);
  
  
  // Debug log - Commented out to reduce console noise
  // console.log('🔍 Sidebar - User role:', user?.role);
  // console.log('🔍 Sidebar - User object:', user);
  // console.log('🔍 Sidebar - User permissions:', userPermissions);
  // console.log('🔍 Sidebar - Departments:', departments);
  
  // Filter active departments - Commented out as not used
  // const activeDepartments = departments.filter(dept => dept.status === 'ACTIVE');

  // Check if dropdown is scrollable
  useEffect(() => {
    if (dropdownRef.current && isDepartmentDropdownOpen) {
      const element = dropdownRef.current;
      const isScrollable = element.scrollHeight > element.clientHeight;
      setIsScrollable(isScrollable);
    }
  }, [isDepartmentDropdownOpen, departments]);

  const navItems = useMemo(
    () => getAccessibleNavItems(user, hasPermission),
    [user, hasPermission]
  );
  
  const iconMap = useMemo(
    () => ({
      list: List,
      people: People,
      shield: Shield,
      building: Building,
      fileText: FileText,
      gear: Gear,
      house: House,
      personCheck: PersonCheck,
      clock: Clock,
      book: Book,
      clipboardCheck: ClipboardCheck,
      exclamationTriangle: ExclamationTriangle,
    }),
    []
  );

  // Debug log after navItems is initialized - Commented out to reduce console noise
  // console.log('🔍 Sidebar - Filtered navItems:', navItems);
  // console.log('🔍 Sidebar - Dashboard permission check:', {
  //   permission: API_PERMISSIONS.DASHBOARD.VIEW,
  //   hasPermission: hasPermission(API_PERMISSIONS.DASHBOARD.VIEW),
  //   hasModuleAccess: hasModuleAccess('DASHBOARD'),
  //   userRole: user?.role,
  //   userPermissions: userPermissions?.map(p => p.name).filter(name => name.includes('dashboard') || name.includes('DASHBOARD'))
  // });
  // 
  // // Debug TRAINEE permissions
  // console.log('🔍 Sidebar - TRAINEE permissions check:', {
  //   userRole: user?.role,
  //   TRAINEES_VIEW_DETAIL: {
  //     permission: API_PERMISSIONS.TRAINEES.VIEW_DETAIL,
  //     hasPermission: hasPermission(API_PERMISSIONS.TRAINEES.VIEW_DETAIL)
  //   },
  //   TRAINEES_VIEW_COURSES: {
  //     permission: API_PERMISSIONS.TRAINEES.VIEW_COURSES,
  //     hasPermission: hasPermission(API_PERMISSIONS.TRAINEES.VIEW_COURSES)
  //   },
  //   TRAINEES_VIEW_ASSESSMENTS: {
  //     permission: API_PERMISSIONS.TRAINEES.VIEW_ASSESSMENTS,
  //     hasPermission: hasPermission(API_PERMISSIONS.TRAINEES.VIEW_ASSESSMENTS)
  //   },
  //   TRAINEES_VIEW_ALL: {
  //     permission: API_PERMISSIONS.TRAINEES.VIEW_ALL,
  //     hasPermission: hasPermission(API_PERMISSIONS.TRAINEES.VIEW_ALL)
  //   },
  //   allUserPermissions: userPermissions?.map(p => p.name)
  // });

  return (
    <div
      className={`bg-primary-custom text-white d-flex flex-column transition-all ${
        collapsed ? "sidebar-collapsed" : ""
      }`}
      style={{
        width: collapsed ? "60px" : "260px",
        minHeight: "100vh",
        transition: "width 0.3s ease",
        position: "fixed",
        top: 0,
        left: 0,
        height: "100vh",
        overflowY: "hidden",
        overflowX: "hidden",
        zIndex: onClose ? 1051 : 1000, // Higher z-index for mobile sidebar (above overlay)
        flexShrink: 0,
        pointerEvents: "auto", // Ensure sidebar can receive clicks
      }}
      onClick={(e) => {
        // Prevent clicks inside sidebar from bubbling to overlay
        e.stopPropagation();
      }}
    >
      {/* Logo/Brand */}
      <div className="p-3 border-bottom border-secondary bg-gradient-primary-custom position-relative" style={{ zIndex: 1 }}>
        <div className="d-flex align-items-center justify-content-center">
          {!collapsed && (
            <>
              <img
                src={logo}
                alt="Logo"
                style={{ width: "50%", marginRight: "0px" }}
              />
            </>
          )}
          {collapsed && (
            <div>
              <Airplane size={24} />
            </div>
          )}
        </div>
        
        {/* Mobile/Tablet close button */}
        {onClose && (
          <Button
            variant="link"
            className="position-absolute top-0 end-0 text-white p-2 d-lg-none"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (onClose) {
                onClose();
              }
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (onClose) {
                onClose();
              }
            }}
            style={{ 
              border: 'none', 
              background: 'transparent', 
              zIndex: 1052,
              minWidth: '40px',
              minHeight: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              pointerEvents: 'auto'
            }}
            aria-label="Close sidebar"
          >
            <X size={24} />
          </Button>
        )}
      </div>

      {/* Navigation */}
      <Nav className="flex-column flex-grow-1 p-3 bg-gradient-primary-custom">
        {navItems.map((item) => {
          const IconComponent = iconMap[item.icon] || List;
          const childIsActive = item.children?.some((child) =>
            location.pathname === child.path
          );
          const isActive =
            location.pathname === item.path || childIsActive;
          const isDropdown = item.children && item.children.length > 0;
          const isOpen = openDropdownId === item.id;

          if (isDropdown) {
            return (
              <Nav.Item key={item.id} className="mb-3">
                <div className="position-relative">
                  <div
                    className={`sidebar-nav-link text-white d-flex align-items-center py-3 pe-1 rounded nav-link ${
                      collapsed ? "justify-content-center" : ""
                    } ${isActive ? "active" : ""}`}
                    style={{
                      minHeight: collapsed ? "48px" : "auto",
                      backgroundColor: isActive
                        ? "rgba(255, 255, 255, 0.1)"
                        : "transparent",
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      if (collapsed) {
                        navigate(item.path);
                        onClose && onClose();
                      } else {
                        setOpenDropdownId((prev) =>
                          prev === item.id ? null : item.id
                        );
                      }
                    }}
                  >
                    <IconComponent
                      size={20}
                      className={collapsed ? "me-2" : "me-3"}
                      style={{
                        display: "inline-block",
                        flexShrink: 0,
                        transition:
                          "transform 0.3s cubic-bezier(.68,-0.55,.27,1.55)",
                      }}
                    />
                    {!collapsed && (
                      <>
                        <span
                          className="sidebar-nav-label flex-grow-1"
                          style={{ overflowWrap: "break-word", lineHeight: "1.2" }}
                        >
                          {item.label}
                        </span>
                        <ChevronDown
                          size={16}
                          className={`ms-auto transition-transform ${
                            isOpen ? "rotate-180" : ""
                          }`}
                          style={{
                            transition: "transform 0.3s ease",
                          }}
                        />
                      </>
                    )}
                  </div>

                  {!collapsed && isOpen && item.children?.length > 0 && (
                    <div className="mt-2 ms-4">
                      {item.children.map((child) => (
                        <Link
                          key={child.id}
                          to={child.path}
                          className="sidebar-nav-link text-white d-flex align-items-center py-2 pe-1 rounded nav-link"
                          style={{
                            backgroundColor:
                              location.pathname === child.path
                                ? "rgba(255, 255, 255, 0.1)"
                                : "transparent",
                            whiteSpace: "normal",
                            overflowWrap: "break-word",
                          }}
                          onClick={() => {
                            onClose && onClose();
                          }}
                        >
                          <span className="sidebar-nav-label">{child.label}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </Nav.Item>
            );
          }

          return (
            <Nav.Item key={item.id} className="mb-3">
              <Link
                to={item.path}
                className={`sidebar-nav-link text-white d-flex align-items-center py-3 pe-1 rounded nav-link ${
                  collapsed ? "justify-content-center" : ""
                } ${isActive ? "active" : ""}`}
                style={{
                  minHeight: collapsed ? "48px" : "auto",
                  backgroundColor: isActive
                    ? "rgba(255, 255, 255, 0.1)"
                    : "transparent",
                  whiteSpace: collapsed ? "nowrap" : "normal",
                  overflowWrap: collapsed ? "normal" : "break-word",
                }}
                onClick={() => {
                  onClose && onClose();
                }}
              >
                <IconComponent
                  size={20}
                  className={collapsed ? "me-2" : "me-3"}
                  style={{
                    display: "inline-block",
                    flexShrink: 0,
                    transition:
                      "transform 0.3s cubic-bezier(.68,-0.55,.27,1.55)",
                  }}
                />
                {!collapsed && (
                  <span
                    className="sidebar-nav-label"
                    style={{ overflowWrap: "break-word", lineHeight: "1.2" }}
                  >
                    {item.label}
                  </span>
                )}
              </Link>
            </Nav.Item>
          );
        })}

        {/* Assessment Event - Academic Department */}
        {isAcademicDept && (
          <Nav.Item className="mb-3">
            <Link
              to={ROUTES.ASSESSMENT_EVENTS}
              className={`sidebar-nav-link text-white d-flex align-items-center py-3 pe-1 rounded nav-link ${collapsed ? "justify-content-center" : ""} ${location.pathname === ROUTES.ASSESSMENT_EVENTS ? "active" : ""}`}
              style={{
                minHeight: collapsed ? "48px" : "auto",
                backgroundColor: location.pathname === ROUTES.ASSESSMENT_EVENTS ? "rgba(255, 255, 255, 0.1)" : "transparent",
                whiteSpace: collapsed ? 'nowrap' : 'normal',
                overflowWrap: collapsed ? 'normal' : 'break-word'
              }}
              onClick={() => {
                onClose && onClose();
              }}
            >
              <CalendarEvent
                size={20}
                className={collapsed ? "me-2" : "me-3"}
                style={{
                  display: "inline-block",
                  flexShrink: 0,
                  transition: "transform 0.3s cubic-bezier(.68,-0.55,.27,1.55)",
                }}
              />
              {!collapsed && <span className="sidebar-nav-label" style={{ overflowWrap: 'break-word', lineHeight: '1.2' }}>Assessment Event</span>}
            </Link>
          </Nav.Item>
        )}

        {/* Department dropdown */}
        {hasAcademicDeptPermission && (
          <Nav.Item className="mb-3">
            <div className="position-relative">
              {/* Department dropdown trigger */}
              <div
                className={`sidebar-nav-link text-white d-flex align-items-center py-3 pe-1 rounded nav-link ${collapsed ? "justify-content-center" : ""} ${location.pathname.startsWith('/academic/departments') ? "active" : ""}`}
                style={{
                  minHeight: collapsed ? "48px" : "auto",
                  backgroundColor: location.pathname.startsWith('/academic/departments') ? "rgba(255, 255, 255, 0.1)" : "transparent",
                }}
              >
                <Building
                  size={20}
                  className={collapsed ? "me-2" : "me-3"}
                  style={{
                    display: "inline-block",
                    flexShrink: 0,
                    transition: "transform 0.3s cubic-bezier(.68,-0.55,.27,1.55)",
                  }}
                />
                {!collapsed && (
                  <>
                    <span 
                      className="sidebar-nav-label flex-grow-1"
                      style={{ cursor: "pointer", overflowWrap: 'break-word', lineHeight: '1.2' }}
                      onClick={() => {
                        setIsDepartmentDropdownOpen(!isDepartmentDropdownOpen);
                        navigate('/academic/departments'); // Keep old route for now (academic-specific)
                      }}
                    >
                      Department
                    </span>
                    <ChevronDown
                      size={16}
                      className="ms-auto"
                      style={{
                        transition: "transform 0.3s ease",
                        cursor: "pointer",
                        transform: isDepartmentDropdownOpen ? "rotate(180deg)" : "rotate(0deg)"
                      }}
                      onClick={() => {
                        setIsDepartmentDropdownOpen(!isDepartmentDropdownOpen);
                      }}
                    />
                  </>
                )}
              </div>

              {/* Department dropdown menu */}
              {!collapsed && isDepartmentDropdownOpen && (
                <div 
                  ref={dropdownRef}
                  className={`position-absolute start-0 end-0 mt-1 sidebar-department-dropdown ${isScrollable ? 'scrollable' : ''}`}
                  style={{
                    zIndex: 1000,
                    maxHeight: "300px",
                    overflowY: "auto"
                  }}
                >
                  {/* Individual departments */}
                  {departmentsLoading ? (
                    <div className="px-3 py-2 text-white-50 sidebar-department-loading">
                      <small>Loading departments...</small>
                    </div>
                  ) : departments.length > 0 ? (
                    departments.map((dept) => (
                      <Link
                        key={dept.id}
                        to={`/academic/course/${dept.id}`}
                        className={`d-block px-3 py-2 text-white text-decoration-none d-flex align-items-center sidebar-department-item ${location.pathname === `/academic/course/${dept.id}` ? 'active' : ''}`}
                        style={{
                          fontSize: "0.875rem",
                          backgroundColor: location.pathname === `/academic/course/${dept.id}` ? "rgba(255, 255, 255, 0.15)" : "transparent",
                          overflowWrap: 'break-word',
                          whiteSpace: 'normal'
                        }}
                        onClick={() => {
                          // Không đóng dropdown, chỉ đóng sidebar trên mobile
                          onClose && onClose();
                        }}
                      >
                        <ChevronRight size={12} className="me-2 sidebar-department-chevron" />
                        {dept.code}
                      </Link>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-white-50">
                      <small>No departments found</small>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Nav.Item>
        )}
      </Nav>
    </div>
  );
};

export default Sidebar;