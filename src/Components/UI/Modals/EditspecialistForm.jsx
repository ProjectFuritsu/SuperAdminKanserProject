import { useEffect, useState } from "react";
import {
  Stack,
  TextInput,
  Group,
  Button,
  Paper,
  Select,
  ActionIcon,
  Divider,
  MultiSelect,
  Box,
  Text,
} from "@mantine/core";
import { TimeInput } from "@mantine/dates";
import { RichTextEditor } from "@mantine/tiptap";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { IconTrash, IconPlus } from "@tabler/icons-react";
import {
  addMedicalSpecialistSchedule,
  deleteMedicalSpecialistSchedule,
  updateHealthInstiMedicalSpecialist,
  updateMedicalSpecialist,
  updateMedicalSpecialistSchedule,
} from "../../../API/medicalspecialistAPI";
import { notifications } from "@mantine/notifications";

export default function EditspecialistForm({ mdata, onSave, onCancel }) {
  const [name, setName] = useState(mdata.name || "");
  const [suffixes, setSuffixes] = useState(mdata.suffixes || "");
  const [specialized, setSpecialized] = useState(
    mdata.specialized
      ? typeof mdata.specialized === "string"
        ? JSON.parse(mdata.specialized)
        : mdata.specialized
      : []
  );

  const editor = useEditor({
    extensions: [StarterKit],
    content: mdata.description || "",
  });

  const [institutionMap, setInstitutionMap] = useState(
    mdata.medical_specialist_health_institution_map || []
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Updates top-level fields like Room or Phone
  const updateMapping = (mapIdx, field, value) => {
    const updatedMap = [...institutionMap];
    updatedMap[mapIdx] = { ...updatedMap[mapIdx], [field]: value };
    setInstitutionMap(updatedMap);
  };

  // Updates specific row in the schedule array
  const updateScheduleRow = (mapIdx, schedIdx, field, value) => {
    const updatedMap = [...institutionMap];
    const schedules = [...updatedMap[mapIdx].schedule_medical_specialist_map];
    schedules[schedIdx] = { ...schedules[schedIdx], [field]: value };
    updatedMap[mapIdx].schedule_medical_specialist_map = schedules;
    setInstitutionMap(updatedMap);
  };

  const addScheduleRow = (mapIdx) => {
    const updatedMap = [...institutionMap];
    updatedMap[mapIdx].schedule_medical_specialist_map.push({
      schedday: "",
      schedopen: "",
      schedclose: "",
      schedtype: "",
    });
    setInstitutionMap(updatedMap);
  };

  const removeScheduleRow = async (mapIdx, schedIdx, schedid) => {
    // 1. If it has an ID, it exists in the database
    if (schedid) {
      const confirmed = window.confirm(
        "Are you sure you want to permanently delete this schedule?"
      );
      if (!confirmed) return;

      try {
        // Call your API function
        await deleteMedicalSpecialistSchedule(schedid);

        notifications.show({
          title: "Deleted",
          message: "Schedule removed from database",
          color: "blue",
        });
      } catch (error) {
        console.error("Delete error:", error);
        notifications.show({
          title: "Error",
          message: "Failed to delete from database",
          color: "red",
        });
        return; // Stop here if DB delete failed
      }
    }

    // 2. Update the UI state (removes the row from the screen)
    const updatedMap = [...institutionMap];
    updatedMap[mapIdx].schedule_medical_specialist_map.splice(schedIdx, 1);
    setInstitutionMap(updatedMap);
  };

  const handleFinalSave = async () => {
    setIsSubmitting(true);
    try {
      // 1. Update Profile Info
      await updateMedicalSpecialist(mdata.msid, {
        name,
        suffixes,
        specialized: JSON.stringify(specialized),
        description: editor?.getHTML(),
      });

      // 2. Loop through Institutions
      for (const inst of institutionMap) {
        // Update Location & Phone for this specific clinic mapping
        await updateHealthInstiMedicalSpecialist(inst.mshimapid, {
          location: inst.location,
          phonenumber: inst.phonenumber,
        });

        // 3. Update Schedules for this Institution
        for (const sched of inst.schedule_medical_specialist_map) {
          if (sched.schedid) {
            // Update existing row
            await updateMedicalSpecialistSchedule(sched.schedid, {
              schedday: sched.schedday,
              schedopen: sched.schedopen,
              schedclose: sched.schedclose,
              schedtype: sched.schedtype,
            });
          } else {
            // This is a NEW row added during editing
            await addMedicalSpecialistSchedule({
              mshimapid: inst.mshimapid,
              schedday: sched.schedday,
              schedopen: sched.schedopen,
              schedclose: sched.schedclose,
              schedtype: sched.schedtype,
            });
          }
        }
      }

      notifications.show({
        title: "Success",
        message: "Specialist updated successfully!",
        color: "green",
      });

      onSave(); // Trigger parent refresh and close modal
    } catch (error) {
      console.error(error);
      notifications.show({
        title: "Update Failed",
        message: "An error occurred while saving changes.",
        color: "red",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    console.log(institutionMap);
  }, []);

  return (
    <Stack gap="lg">
      <Box>
        <Divider label="Specialist Info" labelPosition="left" mb="sm" />
        <Group grow mb="sm">
          <TextInput
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <TextInput
            label="Suffixes"
            value={suffixes}
            onChange={(e) => setSuffixes(e.target.value)}
          />
        </Group>
        <MultiSelect
          label="Specialization"
          data={[
            "Cardiology",
            "Neurology",
            "Oncology",
            "Pediatrics",
            "Dermatology",
          ]}
          value={specialized}
          onChange={setSpecialized}
          mb="sm"
        />
        <Text size="sm" fw={500} mb={4}>
          About Specialist
        </Text>
        <RichTextEditor editor={editor}>
          <RichTextEditor.Toolbar>
            <RichTextEditor.ControlsGroup>
              <RichTextEditor.Bold />
              <RichTextEditor.Italic />
              <RichTextEditor.BulletList />
            </RichTextEditor.ControlsGroup>
          </RichTextEditor.Toolbar>
          <RichTextEditor.Content style={{ minHeight: 100 }} />
        </RichTextEditor>
      </Box>

      <Box>
        <Divider label="Clinical Locations" labelPosition="left" mb="sm" />
        {institutionMap.map((mapItem, idx) => (
          <Paper
            key={mapItem.mshimapid || idx}
            withBorder
            p="md"
            radius="md"
            bg="gray.0"
            mb="md"
          >
            <Stack gap="sm">
              <Group grow>
                <TextInput
                  label="Institution"
                  disabled
                  value={mapItem.health_insti?.health_insti_name || "N/A"}
                />
                <TextInput
                  label="Room/Unit"
                  value={mapItem.location || ""}
                  onChange={(e) =>
                    updateMapping(idx, "location", e.target.value)
                  }
                />
                <TextInput
                  label="Phone"
                  value={mapItem.phonenumber || ""}
                  onChange={(e) =>
                    updateMapping(idx, "phonenumber", e.target.value)
                  }
                />
              </Group>

              <Divider
                variant="dashed"
                label="Active Hours"
                labelPosition="center"
              />

              {mapItem.schedule_medical_specialist_map?.map((sched, sIdx) => (
                <Group key={sIdx} grow align="flex-end">
                  <Select
                    placeholder="Day"
                    data={[
                      "Monday",
                      "Tuesday",
                      "Wednesday",
                      "Thursday",
                      "Friday",
                    ]}
                    value={sched.schedday}
                    onChange={(v) =>
                      updateScheduleRow(idx, sIdx, "schedday", v)
                    }
                  />
                  <TimeInput
                    label="Open"
                    value={sched.schedopen}
                    onChange={(e) =>
                      updateScheduleRow(idx, sIdx, "schedopen", e.target.value)
                    }
                  />
                  <TimeInput
                    label="Close"
                    value={sched.schedclose}
                    onChange={(e) =>
                      updateScheduleRow(idx, sIdx, "schedclose", e.target.value)
                    }
                  />
                  <Select
                    placeholder="Type"
                    data={["Appointment", "Walk ins", "Both"]}
                    value={sched.schedtype}
                    onChange={(v) =>
                      updateScheduleRow(idx, sIdx, "schedtype", v)
                    }
                  />
                  <ActionIcon
                    color="red"
                    variant="light"
                    onClick={() => removeScheduleRow(idx, sIdx, sched.schedid)} // Pass schedid here
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </Group>
              ))}
              <Button
                leftSection={<IconPlus size={14} />}
                variant="ghost"
                size="xs"
                onClick={() => addScheduleRow(idx)}
              >
                Add Schedule Slot
              </Button>
            </Stack>
          </Paper>
        ))}
      </Box>

      <Group justify="flex-end">
        <Button variant="subtle" color="gray" onClick={onCancel}>
          Cancel
        </Button>
        <Button color="blue" onClick={handleFinalSave}>
          Save Changes
        </Button>
      </Group>
    </Stack>
  );
}
