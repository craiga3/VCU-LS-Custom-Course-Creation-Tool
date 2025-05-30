## Development Notes

- [x] Use enrollment API to verify non-student using course roles

- [x] On Auth, do enrollments check and return authorized or not

- [] For each category of course you can create, have checkboxes which make the user read and agree to the conditions of each type of course and course retention details, etc before being able to name the course. 

- [] Put data retention links (to VCU Record's schedule https://docs.google.com/spreadsheets/d/1Xx3WNEIyMaQ61lx3q_-KEV7F5BXRiXOeD29fS4h64K4/edit?gid=233424689#gid=233424689) and policies 

- [] For Catalog button access, logged in user must have completed catalog training course - Have API do catalog lookup during login flow to send catalog:true|false as part of the userinfo payload