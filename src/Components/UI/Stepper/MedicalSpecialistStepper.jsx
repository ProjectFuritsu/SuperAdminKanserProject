import { useEffect, useState } from "react";
import {
  Stepper,
  Button,
  Group,
  TextInput,
  Stack,
  Box,
  Text,
  Flex,
  MultiSelect,
  SimpleGrid,
  ActionIcon,
  Card,
  Select,
  Divider,
  TypographyStylesProvider,
  Badge,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import {
  IconBold,
  IconBuildingHospital,
  IconCheck,
  IconInfoCircle,
  IconMail,
  IconPhone,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react";
import { TimeInput } from "@mantine/dates";
import { useDisclosure } from "@mantine/hooks";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { RichTextEditor } from "@mantine/tiptap";
import Placeholder from "@tiptap/extension-placeholder";
import {
  addHealthInstiMedicalSpecialist,
  addMedicalSpecialist,
  addMedicalSpecialistSchedule,
} from "../../../API/medicalspecialistAPI";

import { fetchHealthInstitution } from "../../../API/healthInstiAPI";
import { notifications } from "@mantine/notifications";

export default function MedicalSpecialistStepper({onSuccess}) {
  const [active, setActive] = useState(0);
  const [loading, { toggle }] = useDisclosure();

  const [healthinsti, sethealthinsti] = useState([]);
  const [isSourceCodeModeActive, onSourceCodeTextSwitch] = useState(false);

  const form = useForm({
    initialValues: {
      name: "",
      specialization: [],
      suffixes: "",
      description: "",
      email: "",
      phonenumber: "",
      institutions: [
        {
          health_institution_id: "",
          location: "",
          schedule: [
            { schedDay: "", schedOpen: "", schedClose: "", schedType: "" },
          ],
        },
      ],
    },

    validate: (values) => {
      // Validation for Step 1: Basic Details
      if (active === 0) {
        return {
          name: values.name.trim().length < 2 ? "Name is too short" : null,
          specialization:
            values.specialization.length === 0
              ? "Select at least one specialization"
              : null,
          suffixes:
            values.suffixes.trim().length === 0
              ? "Suffix is required (e.g., MD)"
              : null,
          // If you want to validate the RichTextEditor/Description:
          // description: values.description.length < 10 ? 'Description is too short' : null,
        };
      }

      // Validation for Step 2: Clinical Affiliations (Nested Validation)
      if (active === 1) {
        const errors = {};
        values.institutions.forEach((inst, index) => {
          if (!inst.health_institution_id) {
            errors[`institutions.${index}.health_institution_id`] =
              "Please select an institution";
          }
          if (!inst.location || inst.location.trim().length === 0) {
            errors[`institutions.${index}.location`] = "Room/Unit is required";
          }

          // Validate nested schedule
          inst.schedule.forEach((sched, schedIndex) => {
            if (!sched.schedDay) {
              errors[`institutions.${index}.schedule.${schedIndex}.schedDay`] =
                "Required";
            }
            if (!sched.schedOpen) {
              errors[`institutions.${index}.schedule.${schedIndex}.schedOpen`] =
                "Required";
            }
            if (!sched.schedClose) {
              errors[
                `institutions.${index}.schedule.${schedIndex}.schedClose`
              ] = "Required";
            }
            if (!sched.schedType) {
              errors[`institutions.${index}.schedule.${schedIndex}.schedType`] =
                "Required";
            }
          });
        });
        return errors;
      }

      // Validation for Step 3: Contact Details
      if (active === 2) {
        return {
          email: /^\S+@\S+$/.test(values.email) ? null : "Invalid email",
          phonenumber:
            values.phonenumber.length < 11 ? "Invalid Number, Too short" : null,
        };
      }

      return {};
    },
  });

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder:
          "I am doctor John, I am specializing medical oncologist ...",
      }),
    ],
    shouldRerenderOnTransaction: true,
    content: "",
    onUpdate({ editor }) {
      // This gets the HTML string and puts it in the form
      form.setFieldValue("description", editor.getHTML());
    },
  });

  // Controller for next and Back
  const nextStep = () => {
    const validation = form.validate();

    if (!validation.hasErrors) {
      setActive((current) => (current < 4 ? current + 1 : current));
    }
  };

  const prevStep = () =>
    setActive((current) => (current > 0 ? current - 1 : current));

  // Get all data needs to be pass in the dropdown
  const getalldata = async () => {
    try {
      const instidata = await fetchHealthInstitution();
      sethealthinsti(instidata.data);
    } catch (error) {
      console.error(err);
    }
  };

  // for Previewing the name of the selected insti
  const getInstitutionName = (id, healthinsti) => {
    const institution = healthinsti?.find(
      (inst) => inst.health_institution_id === id
    );
    return institution ? institution.health_insti_name : "Select Institution";
  };

  const handleSubmit = async () => {
    // Validate the form first
    const validation = form.validate();

    // If there are validation errors, don't proceed
    if (validation.hasErrors) {
      return;
    }

    try {
      // Get the form values
      const formValues = form.values;

      // 1. Add the medical specialist with basic info
      const specialistData = {
        name: formValues.name,
        specialized: formValues.specialization, // array
        suffixes: formValues.suffixes,
        description: formValues.description,
      };

      const specialistResponse = await addMedicalSpecialist(specialistData);
      // Assuming this returns the created specialist ID
      const specialistId = specialistResponse[0]?.msid; // or however your API returns it

      if (!specialistId) {
        console.error("Specialist response:", specialistResponse);
        throw new Error("Failed to get specialist ID from response");
      }

      // 2. Add schedules for each institution
      for (const institution of formValues.institutions) {
        // Add the relationship between specialist and health institution
        const mshimap = await addHealthInstiMedicalSpecialist({
          msid: specialistId,
          health_institution_id: institution.health_institution_id,
          location: institution.location,
          email: formValues.email,
          phonenumber: formValues.phonenumber,
        });

        const mshimapID = mshimap[0]?.mshimapid;
        // Add each schedule for this institution
        for (const schedule of institution.schedule) {
          await addMedicalSpecialistSchedule({
            mshimapid: mshimapID,
            schedday: schedule.schedDay,
            schedopen: schedule.schedOpen,
            schedclose: schedule.schedClose,
            schedtype: schedule.schedType,
          });
        }
      }

      onSuccess();
      // Success! Reset form or redirect
      form.reset();
      notifications.show({
        color: "green",
        title: "Submission Success🎊",
        message: "You successuly insert a new medical specialist.",
      });
    } catch (error) {
      console.error("Error submitting form:", error);
      notifications.show({
        color: "red",
        title: "Submission Failed",
        message: "There was an error submitting the data. Please try again.",
      });
    }
  };

  useEffect(() => {
    getalldata();
  }, []);

  return (
    <Flex direction="column" style={{ height: "auto", overflow: "hidden" }}>
      <Flex style={{ flex: 1, overflow: "auto", minWidth: "900px" }}>
        <Box
          w={"300px"}
          h={550}
          p="md"
          style={{
            borderRight: "1px solid #e9ecef",
            backgroundColor: "#f8f9fa",
          }}
        >
          <Stepper
            active={active}
            onStepClick={setActive}
            orientation="vertical"
            allowNextStepsSelect={false}
          >
            <Stepper.Step label="Basic Details" description="Personal Info" />
            <Stepper.Step label="Clinics" description="Practice Locations" />
            <Stepper.Step label="Contact" description="How to reach you" />
            <Stepper.Step label="Review" description="Confirm details" />
          </Stepper>
        </Box>
        <Box style={{ flex: 1, padding: "10px", overflowY: "auto" }}>
          {/* Step 1: Basic Details */}
          {active === 0 && (
            <Stack gap="md">
              <Text fw={600} size="xl">
                Basic Medical Specialist Details
              </Text>
              <SimpleGrid cols={2}>
                <TextInput
                  label="Medical Specialist Name"
                  placeholder="e.g. Dr. John Doe"
                  withAsterisk
                  {...form.getInputProps("name")}
                />
                <MultiSelect
                  label="Specialization"
                  placeholder="Select specializations"
                  data={[
                    "Cardiology",
                    "Neurology",
                    "Oncology",
                    "Pediatrics",
                    "Dermatology",
                  ]}
                  searchable
                  {...form.getInputProps("specialization")} // This replaces value and onChange
                />
              </SimpleGrid>

              <TextInput
                label="Suffixes"
                placeholder="e.g. MD"
                withAsterisk
                {...form.getInputProps("suffixes")}
              />

              <label
                htmlFor="rte-editor"
                style={{ marginBottom: 5, display: "block" }}
              >
                Tell me about yourself{" "}
                <span style={{ color: "var(--mantine-color-error)" }}>*</span>
              </label>
              <RichTextEditor
                editor={editor}
                onSourceCodeTextSwitch={onSourceCodeTextSwitch}
              >
                <RichTextEditor.Toolbar>
                  <RichTextEditor.ControlsGroup>
                    <RichTextEditor.SourceCode icon={IconBold} />
                  </RichTextEditor.ControlsGroup>

                  {!isSourceCodeModeActive && (
                    <RichTextEditor.Toolbar>
                      <RichTextEditor.ControlsGroup>
                        <RichTextEditor.Blockquote />
                        <RichTextEditor.Bold />
                        <RichTextEditor.Italic />
                        <RichTextEditor.Underline />
                        <RichTextEditor.Strikethrough />
                        <RichTextEditor.ClearFormatting />
                        <RichTextEditor.Highlight />
                        <RichTextEditor.BulletList />
                      </RichTextEditor.ControlsGroup>
                      <RichTextEditor.ControlsGroup>
                        <RichTextEditor.H1 />
                        <RichTextEditor.H2 />
                        <RichTextEditor.H3 />
                        <RichTextEditor.H4 />
                      </RichTextEditor.ControlsGroup>
                    </RichTextEditor.Toolbar>
                  )}
                </RichTextEditor.Toolbar>

                <RichTextEditor.Content
                  style={{
                    height: 100, // Sets the steady height
                    overflowY: "auto", // Enables vertical scrollbar when content exceeds 300px
                  }}
                />
              </RichTextEditor>
            </Stack>
          )}

          {/* Step 2: Clinic Details */}
          {active === 1 && (
            <Stack gap="xl">
              <Group justify="space-between">
                <Box>
                  <Text fw={600} size="xl">
                    Clinical Affiliations
                  </Text>
                  <Text size="sm" c="dimmed">
                    Where do you practice?
                  </Text>
                </Box>
                <Button
                  leftSection={<IconPlus size={16} />}
                  variant="light"
                  onClick={() =>
                    form.insertListItem("institutions", {
                      health_institution_id: "",
                      location: "",
                      schedule: [
                        { schedDay: "", schedOpen: "", schedClose: "" },
                      ],
                    })
                  }
                >
                  Add Clinic
                </Button>
              </Group>

              {form.values.institutions.map((item, index) => (
                <Card key={index} withBorder shadow="sm" radius="md" p="md">
                  <Group justify="space-between" mb="xs">
                    <Group gap="xs">
                      <IconBuildingHospital size={20} color="blue" />
                      <Text fw={600}>Clinic #{index + 1}</Text>
                    </Group>
                    <ActionIcon
                      color="red"
                      variant="subtle"
                      onClick={() => form.removeListItem("institutions", index)}
                    >
                      <IconTrash size={18} />
                    </ActionIcon>
                  </Group>

                  <SimpleGrid cols={2} mb="xs">
                    <Select
                      label="Institution"
                      placeholder={loading ? "Loading..." : "Select Hospital"}
                      disabled={loading} // Good practice to disable while fetching
                      data={healthinsti.map((h) => ({
                        value: String(h.health_insti_id), // Mantine/Select usually expects strings
                        label: h.health_insti_name,
                      }))}
                      {...form.getInputProps(
                        `institutions.${index}.health_institution_id`
                      )}
                    />
                    <TextInput
                      label="Room/Unit"
                      placeholder="Room 101"
                      {...form.getInputProps(`institutions.${index}.location`)}
                    />
                  </SimpleGrid>

                  <Divider my="sm" label="Schedule" labelPosition="center" />

                  <Stack gap="xs">
                    {item.schedule.map((_, schedIndex) => (
                      <Group key={schedIndex} align="flex-end">
                        <Select
                          style={{ flex: 1 }}
                          placeholder="Day"
                          data={[
                            "Monday",
                            "Tuesday",
                            "Wednesday",
                            "Thursday",
                            "Friday",
                          ]}
                          {...form.getInputProps(
                            `institutions.${index}.schedule.${schedIndex}.schedDay`
                          )}
                        />
                        <TimeInput
                          style={{ flex: 1 }}
                          {...form.getInputProps(
                            `institutions.${index}.schedule.${schedIndex}.schedOpen`
                          )}
                        />
                        <TimeInput
                          style={{ flex: 1 }}
                          {...form.getInputProps(
                            `institutions.${index}.schedule.${schedIndex}.schedClose`
                          )}
                        />
                        <Select
                          style={{ flex: 1 }}
                          placeholder="Schedule Type"
                          data={[
                            "Appointment",
                            "Walk ins",
                            "Both Appointment and Walk ins",
                          ]}
                          {...form.getInputProps(
                            `institutions.${index}.schedule.${schedIndex}.schedType`
                          )}
                        />
                        <ActionIcon
                          color="red"
                          variant="light"
                          size="lg"
                          onClick={() =>
                            form.removeListItem(
                              `institutions.${index}.schedule`,
                              schedIndex
                            )
                          }
                        >
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Group>
                    ))}
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() =>
                        form.insertListItem(`institutions.${index}.schedule`, {
                          schedDay: "",
                          schedOpen: "",
                          schedClose: "",
                        })
                      }
                    >
                      + Add Hours
                    </Button>
                  </Stack>
                </Card>
              ))}
            </Stack>
          )}

          {/* Step 3: Contact Details */}
          {active === 2 && (
            <Stack gap="md">
              <Text fw={600} size="xl">
                Contact Information
              </Text>
              <TextInput
                label="Email Address"
                placeholder="doctor@example.com"
                leftSection={<IconMail size={16} />}
                {...form.getInputProps("email")}
              />
              <TextInput
                label="Phone Number"
                placeholder="09986574121"
                leftSection={<IconPhone size={16} />}
                {...form.getInputProps("phonenumber")}
                // The "Hard" Restriction Logic
                onChange={(event) => {
                  const val = event.currentTarget.value;
                  const maxLength = 11;

                  // 1. Check length
                  // 2. Regex: Allow '+' only at the start, and only digits thereafter
                  if (val.length <= maxLength && /^\+?[0-9]*$/.test(val)) {
                    form.setFieldValue("phonenumber", val);
                  }
                }}
                // Visual cue for the user
                description={`${
                  form.values.phonenumber.length
                }/${11} characters`}
              />
            </Stack>
          )}

          {/* Step 4: Preview */}
          {active === 3 && (
            <Stack gap="md">
              <Text fw={600} size="xl">
                Review Information
              </Text>

              <Card withBorder radius="md" padding="lg">
                <Stack gap="lg">
                  {/* Header: Name and Contact Info */}
                  <Box>
                    <Text fw={700} size="xl">
                      Dr. {form.values.name}, {form.values.suffixes}
                    </Text>
                    <Group gap="md" mt={4}>
                      <Text size="sm" c="dimmed">
                        Email: {form.values.email}
                      </Text>
                      <Text size="sm" c="dimmed">
                        Phone: {form.values.phonenumber}
                      </Text>
                    </Group>
                  </Box>

                  {/* Specializations as Badges/Pills */}
                  <Group gap="xs">
                    {form.values.specialization.length > 0 ? (
                      form.values.specialization.map((spec, index) => (
                        <Badge
                          key={index}
                          variant="light"
                          color="blue"
                          size="lg"
                        >
                          {spec}
                        </Badge>
                      ))
                    ) : (
                      <Text size="sm" c="dimmed">
                        No specializations added
                      </Text>
                    )}
                  </Group>

                  <Divider label="About Specialist" labelPosition="left" />

                  {/* Description Section */}
                  <Group gap="xs" align="flex-start" wrap="nowrap">
                    <IconInfoCircle
                      size={18}
                      style={{ marginTop: 4 }}
                      c="dimmed"
                    />
                    {form.values.description ? (
                      <TypographyStylesProvider>
                        <div
                          className="text-sm"
                          dangerouslySetInnerHTML={{
                            __html: form.values.description,
                          }}
                        />
                      </TypographyStylesProvider>
                    ) : (
                      <Text size="sm" c="dimmed">
                        No description provided.
                      </Text>
                    )}
                  </Group>

                  <Divider label="Clinic Details" labelPosition="left" />

                  {/* Clinic & Schedule Section */}
                  <Stack gap="xl">
                    {form.values.institutions.map((insti, index) => {
                      return (
                        <Box
                          key={insti.health_insti_id || index}
                          pl="md"
                          style={{
                            borderLeft:
                              "2px solid var(--mantine-color-blue-filled)",
                          }}
                        >
                          <Stack gap={4}>
                            {/* Institution Header */}
                            <Text fw={600} size="md">
                              {getInstitutionName(
                                insti.health_insti_id,
                                healthinsti
                              )}
                            </Text>

                            <Text size="sm" c="dimmed" mb="xs">
                              {insti.location || "No location provided"}
                            </Text>

                            {/* Schedule Section */}
                            <Text
                              fw={700}
                              size="xs"
                              c="blue"
                              tt="uppercase"
                              lts={1}
                            >
                              Clinic Schedule
                            </Text>

                            <Stack gap={2}>
                              {insti.schedule?.length > 0 ? (
                                insti.schedule.map((sched, indx) => (
                                  <Group key={indx} gap={4} wrap="nowrap">
                                    <Text
                                      size="sm"
                                      fw={500}
                                      style={{ minWidth: "80px" }}
                                    >
                                      {sched.schedDay}:
                                    </Text>
                                    <Text size="sm">
                                      {sched.schedOpen} – {sched.schedClose}
                                      <Text span c="dimmed" fst="italic" ml={5}>
                                        ({sched.schedType})
                                      </Text>
                                    </Text>
                                  </Group>
                                ))
                              ) : (
                                <Text size="xs" c="dimmed">
                                  No schedule set
                                </Text>
                              )}
                            </Stack>
                          </Stack>
                        </Box>
                      );
                    })}
                  </Stack>
                </Stack>
              </Card>
            </Stack>
          )}
        </Box>
      </Flex>

      {/* Controller */}
      <Box
        p={10}
        style={{ borderTop: "1px solid #e9ecef", backgroundColor: "white" }}
      >
        <Group justify="flex-end">
          <Button
            variant="subtle"
            color="gray"
            onClick={prevStep}
            disabled={active === 0}
          >
            Back
          </Button>
          {active === 3 ? (
            <Button
              color="green"
              onClick={() => handleSubmit(form.values)}
              loading={loading}
              leftSection={<IconCheck size={18} />}
            >
              Submit Registration
            </Button>
          ) : (
            <Button onClick={nextStep}>Next Step</Button>
          )}
        </Group>
      </Box>
    </Flex>
  );
}
