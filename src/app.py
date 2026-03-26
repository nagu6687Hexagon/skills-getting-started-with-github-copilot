"""
High School Management System API

A super simple FastAPI application that allows students to view and sign up
for extracurricular activities at Mergington High School.
"""

from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import RedirectResponse
from pydantic import BaseModel
import os
from pathlib import Path
from uuid import uuid4

app = FastAPI(title="Mergington High School API",
              description="API for viewing and signing up for extracurricular activities")

# Mount the static files directory
current_dir = Path(__file__).parent
app.mount("/static", StaticFiles(directory=os.path.join(Path(__file__).parent,
          "static")), name="static")

# In-memory activity database
activities = {
    "Chess Club": {
        "description": "Learn strategies and compete in chess tournaments",
        "schedule": "Fridays, 3:30 PM - 5:00 PM",
        "max_participants": 12,
        "participants": ["michael@mergington.edu", "daniel@mergington.edu"]
    },
    "Programming Class": {
        "description": "Learn programming fundamentals and build software projects",
        "schedule": "Tuesdays and Thursdays, 3:30 PM - 4:30 PM",
        "max_participants": 20,
        "participants": ["emma@mergington.edu", "sophia@mergington.edu"]
    },
    "Gym Class": {
        "description": "Physical education and sports activities",
        "schedule": "Mondays, Wednesdays, Fridays, 2:00 PM - 3:00 PM",
        "max_participants": 30,
        "participants": ["john@mergington.edu", "olivia@mergington.edu"]
    }
}


class RoutineTask(BaseModel):
    title: str
    time: str
    description: str = ""


# In-memory daily routine storage
daily_routine: list[dict] = [
    {
        "id": "1",
        "title": "Morning Exercise",
        "time": "06:30",
        "description": "30 minutes of jogging or stretching",
        "completed": False,
    },
    {
        "id": "2",
        "title": "Breakfast",
        "time": "07:30",
        "description": "Healthy breakfast before school",
        "completed": False,
    },
    {
        "id": "3",
        "title": "School Classes",
        "time": "08:00",
        "description": "Attend morning classes",
        "completed": False,
    },
    {
        "id": "4",
        "title": "Lunch Break",
        "time": "12:00",
        "description": "Lunch and relaxation",
        "completed": False,
    },
    {
        "id": "5",
        "title": "Afternoon Classes",
        "time": "13:00",
        "description": "Attend afternoon classes",
        "completed": False,
    },
    {
        "id": "6",
        "title": "Extracurricular Activity",
        "time": "15:30",
        "description": "Join a club or sport",
        "completed": False,
    },
    {
        "id": "7",
        "title": "Homework & Study",
        "time": "17:00",
        "description": "Complete assignments and review notes",
        "completed": False,
    },
    {
        "id": "8",
        "title": "Dinner",
        "time": "19:00",
        "description": "Family dinner time",
        "completed": False,
    },
    {
        "id": "9",
        "title": "Reading / Free Time",
        "time": "20:00",
        "description": "Wind down with a book or hobby",
        "completed": False,
    },
    {
        "id": "10",
        "title": "Bedtime",
        "time": "22:00",
        "description": "Get a good night's sleep",
        "completed": False,
    },
]


@app.get("/")
def root():
    return RedirectResponse(url="/static/index.html")


@app.get("/activities")
def get_activities():
    return activities


@app.post("/activities/{activity_name}/signup")
def signup_for_activity(activity_name: str, email: str):
    """Sign up a student for an activity"""
    # Validate activity exists
    if activity_name not in activities:
        raise HTTPException(status_code=404, detail="Activity not found")

    # Get the specific activity
    activity = activities[activity_name]

    # Validate student is not already signed up
    if email in activity["participants"]:
        raise HTTPException(status_code=400, detail="Student is already signed up for this activity")

    # Add student
    activity["participants"].append(email)
    return {"message": f"Signed up {email} for {activity_name}"}


@app.get("/routine")
def get_routine():
    """Get all daily routine tasks sorted by time"""
    return sorted(daily_routine, key=lambda t: t["time"])


@app.post("/routine")
def add_routine_task(task: RoutineTask):
    """Add a new task to the daily routine"""
    new_task = {
        "id": str(uuid4()),
        "title": task.title,
        "time": task.time,
        "description": task.description,
        "completed": False,
    }
    daily_routine.append(new_task)
    return new_task


@app.put("/routine/{task_id}/complete")
def complete_routine_task(task_id: str):
    """Toggle the completed status of a routine task"""
    for task in daily_routine:
        if task["id"] == task_id:
            task["completed"] = not task["completed"]
            return task
    raise HTTPException(status_code=404, detail="Task not found")


@app.delete("/routine/{task_id}")
def delete_routine_task(task_id: str):
    """Delete a task from the daily routine"""
    for i, task in enumerate(daily_routine):
        if task["id"] == task_id:
            daily_routine.pop(i)
            return {"message": f"Task '{task['title']}' deleted"}
    raise HTTPException(status_code=404, detail="Task not found")
