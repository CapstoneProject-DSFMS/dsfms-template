# Usage Guide: Your Assessments Component

## 📌 Quick Start

### For End Users (Trainees):
1. Navigate to: `http://localhost:5173/assessments/my-assessments` (or `/trainee/your-assessments`)
2. System automatically loads your enrolled courses and subjects
3. See dynamic tabs for each course and its subjects
4. Switch between "Upcoming Assessments" and "Completed Assessments"
5. Click on any course/subject tab to view its assessments
6. Click "View Details" to see full assessment information

### For Developers:

#### Using the Enhanced Component:
```javascript
import TraineeYourAssessmentsEnhanced from '../../components/Trainee/TraineeYourAssessmentsEnhanced';

// In your page/container:
export default MyPage = () => {
  return <TraineeYourAssessmentsEnhanced />;
};
```

#### Using the Individual Assessment Component:
```javascript
import TraineeAssessmentsByEntity from '../../components/Trainee/TraineeAssessmentsByEntity';

// Display assessments for a specific course
<TraineeAssessmentsByEntity 
  entityType="course"
  entityId="263473b3-8120-4f98-8df5-983fb557de10"
  assessmentType="upcoming"
/>

// Display assessments for a specific subject
<TraineeAssessmentsByEntity 
  entityType="subject"
  entityId="cabc6049-8ba5-4ef1-9c2d-adc7273c0950"
  assessmentType="completed"
/>
```

#### Using the Custom Hook:
```javascript
import useCourseSubjects from '../../hooks/useCourseSubjects';
import { useAuth } from '../../hooks/useAuth';

const MyComponent = () => {
  const { user } = useAuth();
  const { courseSubjects, loading, error, refetch } = useCourseSubjects(user?.id);

  if (loading) return <Spinner />;
  if (error) return <Alert>{error}</Alert>;

  return (
    <div>
      {courseSubjects.map(item => (
        <div key={item.course.id}>
          <h3>{item.course.name}</h3>
          <ul>
            {item.subjects.map(subject => (
              <li key={subject.id}>{subject.name}</li>
            ))}
          </ul>
        </div>
      ))}
      <button onClick={refetch}>Refresh</button>
    </div>
  );
};
```

## 🔌 API Integration Points

### 1. Course-Subjects Loading
```javascript
// Called automatically on component mount
GET /subjects/trainees/{traineeId}/course-subjects

// Response structure:
{
  "traineeId": "string",
  "courses": [
    {
      "course": {
        "id": "string",
        "name": "string",
        "code": "string",
        "status": "string"
      },
      "subjects": [
        {
          "id": "string",
          "name": "string",
          "code": "string",
          "status": "string"
        }
      ]
    }
  ]
}
```

### 2. Course Assessments
```javascript
// Called when course tab is selected
GET /assessments/course?courseId={courseId}

// Query parameters:
// - courseId (required): The course ID
// - page: Page number (default: 1)
// - limit: Items per page (default: 10)

// Response structure:
{
  "assessments": [
    {
      "id": "string",
      "name": "string",
      "subjectId": null,
      "courseId": "string",
      "occuranceDate": "ISO datetime",
      "status": "ON_GOING" | "PENDING" | "APPROVED" | "COMPLETED" | "CANCELLED" | "REJECTED",
      "resultScore": number | null,
      "resultText": "NOT_APPLICABLE" | string | null,
      "pdfUrl": "string" | null,
      "comment": "string" | null,
      "trainee": {
        "id": "string",
        "eid": "string",
        "fullName": "string",
        "email": "string"
      }
    }
  ],
  "totalItems": number,
  "page": number,
  "limit": number,
  "totalPages": number,
  "courseInfo": {
    "id": "string",
    "name": "string",
    "code": "string"
  }
}
```

### 3. Subject Assessments
```javascript
// Called when subject tab is selected
GET /assessments/subject?subjectId={subjectId}

// Query parameters:
// - subjectId (required): The subject ID
// - page: Page number (default: 1)
// - limit: Items per page (default: 10)

// Response structure:
{
  "assessments": [...], // Same structure as course assessments
  "totalItems": number,
  "page": number,
  "limit": number,
  "totalPages": number,
  "subjectInfo": {
    "id": "string",
    "name": "string",
    "code": "string",
    "course": {
      "id": "string",
      "name": "string",
      "code": "string"
    }
  }
}
```

## 🎨 Component Props Reference

### TraineeYourAssessmentsEnhanced
**Props:** None (Uses authentication context)

**Features:**
- Automatically loads current user's courses/subjects
- Creates dynamic tabs for each course and subject
- Manages assessment type filter (upcoming/completed)
- Handles all loading and error states

### TraineeAssessmentsByEntity
**Props:**
```typescript
{
  entityType: 'course' | 'subject' (required),
  entityId: string (required),
  assessmentType: 'upcoming' | 'completed' (default: 'upcoming')
}
```

**Features:**
- Loads and displays assessments for specific course/subject
- Shows trainee information
- Displays status badges with icons
- Shows scores for completed assessments
- Sortable columns
- View details action

### useCourseSubjects Hook
**Parameters:**
```typescript
traineeId: string | null
```

**Returns:**
```typescript
{
  courseSubjects: Array<{
    course: { id, name, code, status },
    subjects: Array<{ id, name, code, status }>
  }>,
  loading: boolean,
  error: string | null,
  refetch: () => Promise<void>
}
```

## 📊 Data Transformation Examples

### Raw API Response → Component State
```javascript
// Input from /subjects/trainees/{traineeId}/course-subjects
{
  traineeId: "6c78e6b8-7821-417e-b243-d59f176b67c4",
  courses: [
    {
      course: {
        id: "263473b3-8120-4f98-8df5-983fb557de10",
        name: "Safety Procedures Training",
        code: "SAF001"
      },
      subjects: [
        {
          id: "cabc6049-8ba5-4ef1-9c2d-adc7273c0950",
          name: "Emergency Procedures",
          code: "SUBJ-001"
        }
      ]
    }
  ]
}

// ↓ Transformed to tabs:
// Tabs created:
// - "course-263473b3-8120-4f98-8df5-983fb557de10" → 📚 SAF001
// - "subject-cabc6049-8ba5-4ef1-9c2d-adc7273c0950" → ▸ SUBJ-001
```

### Assessment Status Filtering
```javascript
// All statuses from API
statuses = ['ON_GOING', 'PENDING', 'APPROVED', 'COMPLETED', 'REJECTED', 'CANCELLED']

// Filter by assessmentType:
if (assessmentType === 'upcoming') {
  filter: ['ON_GOING', 'PENDING', 'NOT_STARTED']
} else {
  filter: ['APPROVED', 'COMPLETED', 'REJECTED', 'CANCELLED']
}
```

## 🚀 Performance Optimization

### API Call Strategy:
1. **Initial Load (OnMount):**
   - Call: `/subjects/trainees/{traineeId}/course-subjects`
   - Cache: courseSubjects state
   - Create tabs without loading data

2. **Tab Selection:**
   - Detect tab change
   - Call: `/assessments/course/{courseId}` OR `/assessments/subject/{subjectId}`
   - Cache: assessments per entity in local state

3. **Filter Change (upcoming/completed):**
   - Don't re-call API
   - Filter cached data by status

### Memory Usage:
- courseSubjects: Cached once per session
- assessments: Cached per selected tab
- No circular data structures
- Proper cleanup on unmount

## 🔍 Error Handling

### Error Scenarios:
```javascript
// 1. No courses found
if (courseData.length === 0) {
  error: "No courses found"
}

// 2. API call fails
catch (err) {
  error: err.message || "Failed to load..."
  toast.error(error)
}

// 3. Invalid entity type
if (!['course', 'subject'].includes(entityType)) {
  error: "Invalid entity type"
}
```

### User Feedback:
- Loading spinner during API calls
- Toast notifications for errors
- Error alert in UI
- Empty state messages

## 🧪 Testing

### Unit Test Example:
```javascript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TraineeYourAssessmentsEnhanced from './TraineeYourAssessmentsEnhanced';

describe('TraineeYourAssessmentsEnhanced', () => {
  it('should load courses and create tabs', async () => {
    render(<TraineeYourAssessmentsEnhanced />);
    
    await waitFor(() => {
      expect(screen.getByText(/SAF001/i)).toBeInTheDocument();
    });
  });

  it('should filter upcoming assessments', async () => {
    render(<TraineeYourAssessmentsEnhanced />);
    
    // Click on course tab
    await userEvent.click(screen.getByText(/SAF001/i));
    
    // Verify upcoming assessments shown
    await waitFor(() => {
      expect(screen.getByText(/On Going/i)).toBeInTheDocument();
    });
  });

  it('should switch to completed assessments', async () => {
    render(<TraineeYourAssessmentsEnhanced />);
    
    // Click completed tab
    await userEvent.click(screen.getByText(/Completed Assessments/i));
    
    // Verify completed assessments shown
    await waitFor(() => {
      expect(screen.getByText(/Approved|Completed|Rejected|Cancelled/i)).toBeInTheDocument();
    });
  });
});
```

### Integration Test Example:
```javascript
// Test actual API calls with mock data
const mockCourseSubjects = {
  courses: [{
    course: { id: 'c1', name: 'Course 1', code: 'C1' },
    subjects: [{ id: 's1', name: 'Subject 1', code: 'S1' }]
  }]
};

const mockAssessments = {
  assessments: [{
    id: 'a1',
    name: 'Assessment 1',
    status: 'ON_GOING',
    trainee: { id: 't1', fullName: 'John Doe' }
  }]
};
```

## 📱 Responsive Behavior

### Desktop:
- Full width tabs
- Horizontal scrolling if too many tabs
- Full table columns

### Tablet:
- Responsive grid
- Tab overflow scrolling
- Stacked actions

### Mobile:
- Single column layout
- Collapsible sections
- Touch-friendly buttons
- Horizontal tab scroll

## 🔐 Permission/Authentication

- Component requires user to be authenticated
- Automatically gets current user from `useAuth()` hook
- User can only see their own assessments
- No data leakage between users

## 🆘 Troubleshooting

### Issue: No tabs shown
**Solution:**
1. Check user is logged in: `console.log(user)`
2. Verify API response: Check Network tab → `/subjects/trainees/...`
3. Check courseData structure: `console.log(response.courses)`

### Issue: Assessments not loading
**Solution:**
1. Verify entityId is passed correctly
2. Check API endpoint: Should be `/assessments/course?courseId=...`
3. Check API response structure
4. Check filters are correct

### Issue: Tabs disappear on refresh
**Solution:**
- This is normal - tabs are recreated on each mount
- Data is refetched from API
- If persisting is needed, implement localStorage caching

### Issue: Performance issues
**Solution:**
1. Verify API responses are not too large
2. Implement pagination in TraineeAssessmentsByEntity
3. Add virtualization for large lists
4. Check for infinite loops in useEffect

## 📚 Related Files

- `/src/api/assessment.js` - Assessment API layer
- `/src/api/subject.js` - Subject API layer
- `/src/hooks/useCourseSubjects.js` - Custom hook
- `/src/hooks/useTableSort.js` - Sorting utility
- `/src/pages/Trainee/EnrolledCoursesPage.jsx` - Similar pattern
- `/src/pages/Trainer/AssessmentAssignmentsPage.jsx` - Reference implementation

---

For more details, see `IMPLEMENTATION_SUMMARY.md`
