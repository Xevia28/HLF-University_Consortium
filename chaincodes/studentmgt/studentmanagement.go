package main

import (
	"encoding/json"
	"fmt"
	"time"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

type Student struct {
	ID               string    `json:"id"`
	Name             string    `json:"name"`
	DateOfBirth      time.Time `json:"dateOfBirth"`
	Gender           string    `json:"gender"`
	GraduationStatus bool      `json:"graduationStatus"`
}

// RecordCount struct keeps track of the number of records
type RecordCount struct {
	Count int `json:"count"`
}

type StudentContract struct {
	contractapi.Contract
}

func (s *StudentContract) CreateStudent(ctx contractapi.TransactionContextInterface, id string, name string,
	dateOfBirth time.Time, gender string, graduationStatus bool) error {
	// Check if a student record with the given id already exists
	existingStudentJSON, err := ctx.GetStub().GetState(id)
	if err != nil {
		return err
	}
	if existingStudentJSON != nil {
		return fmt.Errorf("a student record with the id '%s' already exists", id)
	}
	student := Student{
		ID:               id,
		Name:             name,
		DateOfBirth:      dateOfBirth,
		Gender:           gender,
		GraduationStatus: graduationStatus,
	}
	studentJSON, err := json.Marshal(student)
	if err != nil {
		return err
	}
	err = ctx.GetStub().PutState(id, studentJSON)
	if err != nil {
		return fmt.Errorf("failed to put to world state. %v", err)
	}
	eventPayload := fmt.Sprintf("Created student: %s", id)
	err = ctx.GetStub().SetEvent("CreateStudent", []byte(eventPayload))
	if err != nil {
		return fmt.Errorf("event failed to register. %v", err)
	}
	// Update record count
	return s.UpdateRecordCount(ctx, 1)
}

func (s *StudentContract) ReadStudent(ctx contractapi.TransactionContextInterface, id string) (*Student, error) {
	studentJSON, err := ctx.GetStub().GetState(id)
	if err != nil {
		return nil, fmt.Errorf("failed to read from world state: %v", err)
	}
	if studentJSON == nil {
		return nil, fmt.Errorf("the student %s does not exist", id)
	}
	var student Student
	err = json.Unmarshal(studentJSON, &student)
	if err != nil {
		return nil, err
	}
	eventPayload := fmt.Sprintf("Read student: %s", id)
	err = ctx.GetStub().SetEvent("ReadStudent", []byte(eventPayload))
	if err != nil {
		return nil, fmt.Errorf("event failed to register. %v", err)
	}
	return &student, nil
}

func (s *StudentContract) UpdateStudent(ctx contractapi.TransactionContextInterface, id string, name string,
	dateOfBirth time.Time, gender string, graduationStatus bool) error {
	student, err := s.ReadStudent(ctx, id)
	if err != nil {
		return err
	}
	student.Name = name
	student.DateOfBirth = dateOfBirth
	student.Gender = gender
	student.GraduationStatus = graduationStatus
	studentJSON, err := json.Marshal(student)
	if err != nil {
		return err
	}
	err = ctx.GetStub().PutState(id, studentJSON)
	if err != nil {
		return fmt.Errorf("failed to put to world state. %v", err)
	}
	eventPayload := fmt.Sprintf("Updated student: %s", id)
	err = ctx.GetStub().SetEvent("UpdateStudent", []byte(eventPayload))
	if err != nil {
		return fmt.Errorf("event failed to register. %v", err)
	}
	return nil
}

func (s *StudentContract) DeleteStudent(ctx contractapi.TransactionContextInterface, id string) error {
	err := ctx.GetStub().DelState(id)
	if err != nil {
		return fmt.Errorf("failed to delete state: %v", err)
	}
	eventPayload := fmt.Sprintf("Deleted student: %s", id)
	err = ctx.GetStub().SetEvent("DeleteStudent", []byte(eventPayload))
	if err != nil {
		return fmt.Errorf("event failed to register. %v", err)
	}
	// Update record count
	return s.UpdateRecordCount(ctx, -1)
}

// Record Count
// UpdateRecordCount updates the total number of student records
func (s *StudentContract) UpdateRecordCount(ctx contractapi.TransactionContextInterface, increment int) error {
	countJSON, err := ctx.GetStub().GetState("recordCount")
	if err != nil {
		return err
	}
	var recordCount RecordCount
	if countJSON == nil {
		recordCount = RecordCount{Count: 0}
	} else {
		err = json.Unmarshal(countJSON, &recordCount)
		if err != nil {
			return err
		}
	}
	recordCount.Count += increment
	newCountJSON, err := json.Marshal(recordCount)
	if err != nil {
		return err
	}
	return ctx.GetStub().PutState("recordCount", newCountJSON)
}

// GetRecordCount returns the total number of student records
func (s *StudentContract) GetRecordCount(ctx contractapi.TransactionContextInterface) (int, error) {
	countJSON, err := ctx.GetStub().GetState("recordCount")
	if err != nil {
		return 0, err
	}
	var recordCount RecordCount
	err = json.Unmarshal(countJSON, &recordCount)
	if err != nil {
		return 0, err
	}
	return recordCount.Count, nil
}

func main() {
	chaincode, err := contractapi.NewChaincode(new(StudentContract))
	if err != nil {
		fmt.Printf("Error create student chaincode: %s", err.Error())
		return
	}
	if err := chaincode.Start(); err != nil {
		fmt.Printf("Error starting student chaincode: %s", err.Error())
	}
}
