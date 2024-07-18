import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import roomBg from "../assets/roombg.jpg";
import "./User.css";
import { useTable } from "react-table";
import { FaChevronDown, FaChevronRight } from "react-icons/fa";

import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import WithAuth from "../auth/WithAuth";

const Dashboard = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [showMyReservations, setShowMyReservations] = useState(true);
  const [showOtherMeetings, setShowOtherMeetings] = useState(true);
  const [firstLogin, setFirstLogin] = useState(false); // Track first login state
  const formRef = useRef();
  const userId = localStorage.getItem("userId");

  const [formData, setFormData] = useState({
    passWord: "",
    email: "",
    department: "",
  });

  const [userData, setUsers] = useState(null);
  const [bookData, setBookData] = useState([]);
  const [roomData, setRoomName] = useState("");
  const [loading, setLoading] = useState(true);

  const userName = "John Doe";
  const department = "Starlight";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };

        const response = await axios.get(
          `http://localhost:8800/api/user/${userId}`,
          { headers }
        );
        if (response.status === 200) {
          setUsers(response.data);
          if (response.data.resetPass === false) {
            setFirstLogin(true);
          }
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchBookData = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };

        const response = await axios.get(`http://localhost:8800/api/book/`, {
          headers,
        });
        if (response.status === 200) {
          setBookData(response.data);
        }
      } catch (error) {
        console.error("Error fetching book data:", error);
      }
    };

    fetchBookData();
  }, []);

  useEffect(() => {
    const initialReservations = bookData
      .filter((book) => 
        book.user._id === userId && 
        book.title && 
        book.scheduleDate !== null && 
        book.startTime !== null
      )
      .map((book) => ({
        title: book.title,
        status: book.confirmation ? "Approved" : "Pending",
        date: new Date(book.scheduleDate).toLocaleDateString(),
        time: new Date(book.startTime).toLocaleTimeString(),
        end: new Date(book.endTime).toLocaleTimeString(),
        room: book.roomName,
        creator: book.user.userName,
        members: book.attendees,
        userName: book.user.userName,
        department: book.user.department,
        pax: book.caps.pax,
        agenda: book.agenda
      }));
    setReservations(initialReservations);
  
    const initialOtherMeetings = bookData
      .filter((book) => 
        book.user._id !== userId && 
        book.title && 
        book.scheduleDate !== null && 
        book.startTime !== null
      )
      .map((book) => ({
        title: book.title,
        status: book.confirmation ? "Approved" : "Pending",
        date: new Date(book.scheduleDate).toLocaleDateString(),
        time: new Date(book.startTime).toLocaleTimeString(),
        end: new Date(book.endTime).toLocaleTimeString(),
        room: book.roomName,
        creator: book.user.userName,
        members: book.attendees,
        userName: book.user.userName,
        department: book.user.department,
        pax: book.caps.pax,
        agenda: book.agenda
      }));
    setOtherMeetings(initialOtherMeetings);
  }, [bookData]);
  

  const [reservations, setReservations] = useState([]);
  const [otherMeetings, setOtherMeetings] = useState([]);
  const rooms = ["Palawan", "Boracay", "Palawan and Boracay"];

  const handleMeetingClick = (meeting) => {
    setSelectedMeeting(meeting);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleDeleteReservation = (index) => {
    setReservations((prevReservations) =>
      prevReservations.filter((_, i) => i !== index)
    );
  };

  const toggleMyReservations = () => {
    setShowMyReservations(!showMyReservations);
  };

  const toggleOtherMeetings = () => {
    setShowOtherMeetings(!showOtherMeetings);
  };

  const myReservationsColumns = React.useMemo(
    () => [
      { Header: "Meeting Title", accessor: "title" },
      {
        Header: "Status",
        accessor: "status",
        Cell: ({ value }) => (
          <span className={`status ${value.toLowerCase()}`}>{value}</span>
        ),
      },
      { Header: "Date", accessor: "date" },
      { Header: "Time", accessor: "time" },
      { Header: "Meeting Room", accessor: "room" },
      { Header: "Meeting Creator", accessor: "creator" },
      {
        Header: "",
        accessor: "actions",
        Cell: ({ row }) => (
          <>
            <button
              className="full-btn"
              onClick={() => handleMeetingClick(row.original)}
            >
              <i className="fas fa-info-circle"></i> Details
            </button>
            <button
              className="delete-btn"
              onClick={() => handleDeleteReservation(row.index)}
            >
              <i className="fas fa-trash-alt"></i> Cancel Meeting
            </button>
          </>
        ),
      },
    ],
    []
  );

  const otherMeetingsColumns = React.useMemo(
    () => [
      { Header: "Meeting Title", accessor: "title" },
      {
        Header: "Status",
        accessor: "status",
        Cell: ({ value }) => (
          <span className={`status ${value.toLowerCase()}`}>{value}</span>
        ),
      },
      { Header: "Date", accessor: "date" },
      { Header: "Time", accessor: "time" },
      { Header: "Meeting Room", accessor: "room" },
      { Header: "Meeting Creator", accessor: "creator" },
      {
        Header: "",
        accessor: "actions",
        Cell: ({ row }) => (
          <button
            className="full-btn"
            onClick={() => handleMeetingClick(row.original)}
          >
            <i className="fas fa-info-circle"></i> Details
          </button>
        ),
      },
    ],
    []
  );

  const myReservationsTable = useTable({
    columns: myReservationsColumns,
    data: reservations,
  });
  const otherMeetingsTable = useTable({
    columns: otherMeetingsColumns,
    data: otherMeetings,
  });

  const handleRegistrationSubmit = async (e) => {
    e.preventDefault();

    try {
      const validationResponse = await axios.post(
        `http://localhost:8800/api/auth/validate`,
        {
          email: formData.email,
        }
      );

      if (validationResponse.data.email.exists === true) {
        toast.error("Email is already registered");
        return;
      }
    } catch (error) {
      toast.error("Failed to validate email");
      return;
    }

    const updatedUser = {
      passWord: formData.passWord,
      email: formData.email,
      department: formData.department,
      resetPass: true,
    };

    try {
      const token = localStorage.getItem("authToken");

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const updateResponse = await axios.patch(
        `http://localhost:8800/api/user/edit/${userId}`,
        updatedUser,
        { headers }
      );

      if (updateResponse.status === 201) {
        toast.success("Successfully changed info.");
        setFirstLogin(false);
      }
    } catch (error) {
      console.error("Error during patch:", error);
    }
  };

  const handleReserveClick = async (room) => {
    setRoomName(room);

    const reserveRoom = {
      roomName: room,
      user: userData._id,
    };

    try {
      const token = localStorage.getItem("authToken");

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const updateResponse = await axios.post(
        `http://localhost:8800/api/book/create`,
        reserveRoom,
        { headers }
      );

      if (updateResponse.status === 201) {
        toast.success(`Reserved Room: ${room}`);
        localStorage.setItem("reserveToken", updateResponse.data.result._id);
        navigate("/reserve");
      }
    } catch (error) {
      console.error("Error during patch:", error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="dashboard">
      {firstLogin && (
        <div className="reg-overlay">
          <div className="registration-form-modal">
            {userData && <h2>Welcome, {userData.userName}!</h2>}
            <form ref={formRef} onSubmit={handleRegistrationSubmit}>
              <div className="form-section">
                <label htmlFor="email">Email Address</label>
                <p>
                  *Please enter your email address so we can notify you about
                  confirmations, advisory, etc.
                </p>
                <input
                  type="text"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email Address"
                  required
                />
              </div>
              <div className="form-section">
                <label htmlFor="department">Department</label>
                <p>
                  *Please enter your designated department for specification of
                  the meeting.
                </p>
                <select
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Department</option>
                  <option value="Philippine Dragon Media Network">
                    Philippine Dragon Media Network
                  </option>
                  <option value="GDS Travel Agency">GDS Travel Agency</option>
                  <option value="FEILONG Legal">FEILONG Legal</option>
                  <option value="STARLIGHT">STARLIGHT</option>
                  <option value="BIG VISION PRODS.">BIG VISION PRODS.</option>
                  <option value="SuperNova">SuperNova</option>
                  <option value="ClearPath">ClearPath</option>
                  <option value="Dragon AI">Dragon AI</option>
                </select>
              </div>
              <div className="form-section">
                <label htmlFor="new-password">
                  Please enter your new password.
                </label>
                <p>
                  *Please enter your new password to for your security and
                  privacy.
                </p>
                <input
                  type="password"
                  id="passWord"
                  name="passWord"
                  value={formData.passWord}
                  onChange={handleChange}
                  placeholder="New Password"
                  required
                />
              </div>
              <button type="submit">Confirm</button>
            </form>
          </div>
        </div>
      )}
      <main className="dashboard-main">
        <ToastContainer />
        <h1>My Dashboard</h1>

        <h2>Book a Meeting Room</h2>
        <div className="card-container">
          {rooms.map((place, index) => (
            <div
              key={`room-${index}`}
              className="card"
              style={{ backgroundImage: `url(${roomBg})` }}
            >
              <div className="overlay">
                <h3>{place}</h3>
                <button
                  className="reserve-btn"
                  onClick={() => handleReserveClick(place)}
                >
                  Reserve
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="toggle-header" onClick={toggleMyReservations}>
          <h2>
            My Reservations ({reservations.length}){" "}
            {showMyReservations ? <FaChevronDown /> : <FaChevronRight />}
          </h2>
        </div>
        {showMyReservations && (
          <div className="table-container">
            <table
              className="reservation-table"
              {...myReservationsTable.getTableProps()}
            >
              <thead>
                {myReservationsTable.headerGroups.map((headerGroup) => (
                  <tr key={headerGroup.id} {...headerGroup.getHeaderGroupProps()}>
                    {headerGroup.headers.map((column) => (
                      <th key={column.id} {...column.getHeaderProps()}>
                        {column.render("Header")}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody {...myReservationsTable.getTableBodyProps()}>
                {myReservationsTable.rows.map((row) => {
                  myReservationsTable.prepareRow(row);
                  return (
                    <tr {...row.getRowProps()}>
                      {row.cells.map((cell) => (
                        <td key={cell.getCellProps().key} {...cell.getCellProps()}>{cell.render("Cell")}</td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="toggle-header" onClick={toggleOtherMeetings}>
          <h2>
            Other Meetings ({otherMeetings.length}){" "}
            {showOtherMeetings ? <FaChevronDown /> : <FaChevronRight />}
          </h2>
        </div>
        {showOtherMeetings && (
          <div className="table-container">
            <table
              className="reservation-table1"
              {...otherMeetingsTable.getTableProps()}
            >
              <thead>
                {otherMeetingsTable.headerGroups.map((headerGroup) => (
                  <tr key={headerGroup.id} {...headerGroup.getHeaderGroupProps()}>
                    {headerGroup.headers.map((column) => (
                      <th key={column.id} {...column.getHeaderProps()}>
                        {column.render("Header")}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody {...otherMeetingsTable.getTableBodyProps()}>
                {otherMeetingsTable.rows.map((row) => {
                  otherMeetingsTable.prepareRow(row);
                  return (
                    <tr {...row.getRowProps()}>
                      {row.cells.map((cell) => (
                        <td key={cell.getCellProps().key} {...cell.getCellProps()}>{cell.render("Cell")}</td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {showModal && selectedMeeting && (
          <div className="details-modal">
            <div className="details-content">
              <div className="closetab">
                <button className="close-btn" onClick={handleCloseModal}>
                  &times;
                </button>
              </div>
              <h2>{selectedMeeting.title}</h2>
              <div className="modal-columns">
                <div className="left-content">
                  <p>
                    <strong>Username:</strong> {selectedMeeting.userName}
                  </p>
                  <p>
                    <strong>Department:</strong> {selectedMeeting.department}
                  </p>
                  <p>
                    <strong>Number of PAX:</strong> {selectedMeeting.pax}
                  </p>
                  <p>
                    <strong>Purpose of the Meeting:</strong>{" "} {selectedMeeting.agenda}
                  </p>
                  <p className="members">
                    <strong>Members:</strong>{" "}
                    {selectedMeeting.members.join(", ")}
                  </p>
                </div>
                <div className="right-content">
                  <h3>{selectedMeeting.room}</h3>
                  <p>
                    <strong>Date:</strong> {selectedMeeting.date}
                  </p>
                  <p>
                    <strong>Meeting Start:</strong> {selectedMeeting.time}
                  </p>
                  <p>
                    <strong>Meeting End:</strong> {selectedMeeting.end}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        {!firstLogin && <></>}
      </main>
    </div>
  );
};

export default WithAuth(Dashboard);
