import { useForm } from "@mantine/form";
import { useEffect, useState } from "react";
import {
  TextInput,
  Select,
  Textarea,
  Button,
  Stack,
  Stepper,
  Paper,
  Group,
  Box,
  ThemeIcon,
  Divider,
  Badge,
  SimpleGrid,
  Text,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useDisclosure } from "@mantine/hooks";
import {
  getpublicationauthor,
  publicationTypes,
} from "../../../API/Utils/PublicationUtils";
import {
  IconCalendarUser,
  IconCheck,
  IconFileDescription,
  IconLink,
  IconUser,
} from "@tabler/icons-react";
import { addContent, addFeeds, addreference } from "../../../API/feedAPI";
import { notifications } from "@mantine/notifications";

export default function FeedsStepper({ handleSuccess }) {
  const [active, setActive] = useState(0);
  const [loading, handlers] = useDisclosure(false); // For submit button loading state

  const [pubType, setPublicationTypes] = useState([]);
  const [authordata, setAuthordata] = useState([]);

  const form = useForm({
    initialValues: {
      publication_title: "",
      publication_date: "",
      author_id: "",
      publication_type: "",
      content_detail: "",
      ref_detail: "",
    },

    validate: {
      publication_title: (val) =>
        val.trim().length < 5 ? "Title must be at least 5 characters" : null,

      // Added date validation
      publication_date: (val) =>
        !val ? "Please select a publication date" : null,

      publication_type: (val) =>
        !val ? "Select a standardized publication type" : null,

      author_id: (val) =>
        !val || val.trim().length === 0 ? "Author ID is required" : null,

      content_detail: (val) =>
        val.trim().length < 20
          ? "Content must be at least 20 characters"
          : null,
    },
  });

  // Handle Database Submission
  const handleSubmit = async (values) => {
    handlers.open(); // Trigger Mantine loading state

    try {
      // 1. Create the Primary Feed Entry
      // We await this to get the ID needed for the related tables
      const feedResponse = await addFeeds({
        publication_title: values.publication_title,
        publication_date: values.publication_date,
        publication_type: values.publication_type,
        author_id: values.author_id,
      });

      const pubId = feedResponse?.data?.[0].publication_id;

      if (!pubId) {
        throw new Error("Failed to retrieve Publication ID from database.");
      }

      // 2. Add the Detailed Content
      // Linking it to the main feed via the ID
      await addContent({
        publication_id: pubId,
        content_detail: values.content_detail,
      });

      // 3. Add the Reference Data
      await addreference({
        publication_id: pubId,
        ref_detail: values.ref_detail,
      });

      // 4. Success UI Flow
      notifications.show({
        color: "teal",
        title: "Publication Successful",
        message: "All data has been synchronized with the database.",
      });

      form.reset();
      handleSuccess();
      setActive(0);
    } catch (error) {
      console.error("Submission Sequence Failed:", error);
      notifications.show({
        color: "red",
        title: "Insertion Error",
        message: `An error was encountered: ${
          error.message || "Check database connection"
        }`,
      });
    } finally {
      handlers.close(); // Turn off loading spinner
    }
  };

  const nextStep = () => {
    // 1. Validate based on the current active step
    if (active === 0) {
      const isTitleInvalid = form.validateField("publication_title").hasError;
      const isTypeInvalid = form.validateField("publication_type").hasError;
      const isDateInvalid = form.validateField("publication_date").hasError;

      if (isTitleInvalid || isTypeInvalid || isDateInvalid) return;
    }

    if (active === 1) {
      const isContentInvalid = form.validateField("content_detail").hasError;
      if (isContentInvalid) return;
    }

    if (active === 2) {
      const isAuthorInvalid = form.validateField("author_id").hasError;
      if (isAuthorInvalid) return;
    }

    // 2. If valid, move to the next step
    setActive((current) => (current < 3 ? current + 1 : current));
  };

  const getpubType = async () => {
    try {
      const response = await publicationTypes();
      const formatted = response.map((item) => ({
        value: item.publication_type_code.toString(),
        label: item.type_description,
      }));

      setPublicationTypes(formatted);
    } catch (error) {
      console.error("Failed to load publication types", error);
    }
  };

  const getAuthors = async () => {
    try {
      const response = await getpublicationauthor();
      const formatted = response.map((item) => ({
        value: item.author_id.toString(),
        label: item.author_name,
      }));

      setAuthordata(formatted);
    } catch (error) {
      console.error("Fetching author Error:", error);
      throw error;
    }
  };

  useEffect(() => {
    getpubType();
    getAuthors();
  }, []);

  return (
    <Box p="xl">
      <Stepper active={active} onStepClick={setActive} breakpoint="sm">
        <Stepper.Step label="Identity" description="Title & Type">
          <Stack mt="md">
            <TextInput
              label="Publication Title"
              placeholder="Title of the content"
              required
              {...form.getInputProps("publication_title")}
            />

            <DateInput
              label="Publication Date"
              placeholder="Pick date"
              required
              {...form.getInputProps("publication_date")}
            />

            <Select
              label="Publication Type"
              placeholder="Select standardized type"
              data={pubType}
              searchable
              maxDropdownHeight={140}
              {...form.getInputProps("publication_type")}
            />
          </Stack>
        </Stepper.Step>

        <Stepper.Step label="Body" description="Content Details">
          <Stack mt="md">
            <Textarea
              label="Content Detail"
              minRows={10}
              required
              {...form.getInputProps("content_detail")}
            />
          </Stack>
        </Stepper.Step>

        <Stepper.Step label="Metadata" description="Author & Refs">
          <Stack mt="md">
            <Select
              label="Author"
              placeholder="Select an author"
              data={authordata}
              searchable
              maxDropdownHeight={140}
              {...form.getInputProps("author_id")}
            />

            <Textarea
              label="Reference Details (Link/URL)"
              {...form.getInputProps("ref_detail")}
            />
          </Stack>
        </Stepper.Step>

        <Stepper.Completed>
          <Paper withBorder p="xl" mt="xl" radius="md" shadow="sm">
            <Stack gap="lg">
              {/* Header Section */}
              <Group justify="space-between" align="flex-start">
                <Stack gap={4}>
                  <Text size="xs" fw={700} c="dimmed" tt="uppercase">
                    Publication Summary
                  </Text>
                  <Text size="xl" fw={800} c="blue.9">
                    {form.values.publication_title || "Untitled Document"}
                  </Text>
                </Stack>
                <Badge size="xl" variant="light" color="blue" radius="sm">
                  {/* Helper to show label instead of ID if needed */}
                  {pubType.find((t) => t.value === form.values.publication_type)
                    ?.label || "General"}
                </Badge>
              </Group>

              <Divider />

              {/* Info Grid */}
              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
                <Group wrap="nowrap">
                  <ThemeIcon variant="light" size="lg" radius="md">
                    <IconUser size="1.2rem" />
                  </ThemeIcon>
                  <Box>
                    <Text size="xs" c="dimmed">
                      Author Identification
                    </Text>
                    <Text fw={500}>{form.values.author_id || "N/A"}</Text>
                  </Box>
                </Group>

                <Group wrap="nowrap">
                  <ThemeIcon variant="light" color="teal" size="lg" radius="md">
                    <IconCalendarUser size="1.2rem" />
                  </ThemeIcon>
                  <Box>
                    <Text size="xs" c="dimmed">
                      Date of Publication
                    </Text>
                    <Text fw={500}>{form.values.publication_date}</Text>
                  </Box>
                </Group>
              </SimpleGrid>

              {/* Detailed Sections */}
              <Stack gap="xs">
                <Group gap={8}>
                  <IconFileDescription size="1rem" color="gray" />
                  <Text size="sm" fw={700}>
                    Content Detail
                  </Text>
                </Group>
                <Paper withBorder p="sm" bg="gray.0" radius="sm">
                  <Text
                    size="sm"
                    lineClamp={5}
                    style={{ whiteSpace: "pre-line" }}
                  >
                    {form.values.content_detail}
                  </Text>
                </Paper>
              </Stack>

              <Stack gap="xs">
                <Group gap={8}>
                  <IconLink size="1rem" color="gray" />
                  <Text size="sm" fw={700}>
                    Reference Details
                  </Text>
                </Group>
                <Text size="sm" c={form.values.ref_detail ? "black" : "dimmed"}>
                  {form.values.ref_detail ||
                    "No references provided for this entry."}
                </Text>
              </Stack>

              <Group
                bg="green.0"
                p="sm"
                style={{ borderRadius: "8px", border: "1px solid #b2f2bb" }}
              >
                <IconCheck size="1.2rem" color="green" />
                <Text size="sm" c="green.9" fw={500}>
                  Data validated and ready for database entry.
                </Text>
              </Group>
            </Stack>
          </Paper>
        </Stepper.Completed>
      </Stepper>

      <Group justify="right" mt="xl">
        {active !== 0 && (
          <Button variant="default" onClick={() => setActive(active - 1)}>
            Back
          </Button>
        )}
        {active < 3 ? (
          <Button onClick={nextStep}>Next Step</Button>
        ) : (
          <Button
            color="green"
            loading={loading}
            onClick={() => form.onSubmit(handleSubmit)()}
          >
            Submit to Database
          </Button>
        )}
      </Group>
    </Box>
  );
}
