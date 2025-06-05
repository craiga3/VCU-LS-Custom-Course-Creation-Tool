## Development Notes

- [x] Use enrollment API to verify non-student using course roles

- [x] On Auth, do enrollments check and return authorized or not

- [x] For each category of course you can create, have checkboxes which make the user read and agree to the conditions of each type of course and course retention details, etc before being able to name the course. 

- [] Put data retention links (to VCU Record's schedule https://docs.google.com/spreadsheets/d/1Xx3WNEIyMaQ61lx3q_-KEV7F5BXRiXOeD29fS4h64K4/edit?gid=233424689#gid=233424689) and policies 

- [] For Catalog button access, logged in user must have completed catalog training course - Have API do catalog lookup during login flow to send catalog:true|false as part of the userinfo payload

In terms of information needed to create a course: https://canvas.instructure.com/doc/api/courses.html#method.courses.create
Course Name - User Set
Course Code - Duplicate of Course Name
Course Term ID - Script hardcoded for default term
course SIS ID - Script will generate in the following format [TYPE]-[RAND]{UNIXTIME]- =[eid of creator]
course account ID - dependent on type of course selected

payload from web: 
{
    type: Sandbox|Primary|Training|Catalog,
    apiToken:,
    courseName:,
    instructorID:,
}

Name Formats: 
Sandbox = Sandbox - [CourseName] | SIS ID = SB-[RRRR][UNIXTIME]-[EID]
Training = As entered | SIS ID = TR-[RRRR][UNIXTIME]
Primary Course Template = Primary - [SUBJ] - [CourseNum] - [EID] - [MM/YY] | SIS ID = PR-[RRRR][UNIXTIME]-[EID]
Catalog Course = As Entered

sandbox courses should have the delete & reset permissions enabled for teachers

Also - consider advising/resource courses