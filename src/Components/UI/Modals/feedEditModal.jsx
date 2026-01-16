import {
  TextInput,
  Select,
  Stack,
  Group,
  Button,
  Textarea,
  Title,
  Divider,
  Text,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { modals } from "@mantine/modals";
import { IconEdit, IconTrash } from "@tabler/icons-react";
import { useState } from "react";

export default function FeedEditModal({
  initialValues,
  pubType,
  authordata,
  onSave,
  handleDelete,
}) {
  const [isEditing, setIsEditing] = useState(false);

  const form = useForm({
    initialValues: initialValues,
  });

  if (!isEditing) {
    return (
      <Stack gap="md">
        <div>
          <Text size="xs" c="dimmed" fw={700} tt="uppercase">
            Title
          </Text>
          <Title order={4}>{form.values.publication_title}</Title>
        </div>

        <Group grow>
          <div>
            <Text size="xs" c="dimmed" fw={700} tt="uppercase">
              Type
            </Text>
            <Text>
              {pubType.find((t) => t.value === form.values.publication_type)
                ?.label || "N/A"}
            </Text>
          </div>
          <div>
            <Text size="xs" c="dimmed" fw={700} tt="uppercase">
              Author
            </Text>
            <Text>
              {authordata.find((a) => a.value === form.values.author_id)
                ?.label || "N/A"}
            </Text>
          </div>
        </Group>

        <div>
          <Text size="xs" c="dimmed" fw={700} tt="uppercase">
            Date
          </Text>
          <Text>{form.values.publication_date?.toLocaleDateString()}</Text>
        </div>

        <Divider variant="dashed" />

        <div>
          <Text size="xs" c="dimmed" fw={700} tt="uppercase" mb={4}>
            Content Details
          </Text>
          <Text size="sm" style={{ whiteSpace: "pre-wrap" }}>
            {form.values.detail || "No content provided."}
          </Text>
        </div>

        <div>
          <Text size="xs" c="dimmed" fw={700} tt="uppercase" mb={4}>
            References
          </Text>
          <Text size="sm" c="dimmed">
            {form.values.ref_detail || "No references available."}
          </Text>
        </div>

        <Group justify="flex-end" mt="xl">
          <Button
            color="red"
            leftSection={<IconTrash size={16} />}
            onClick={() => handleDelete()}
          >
            Delete Publication
          </Button>
          <Button
            leftSection={<IconEdit size={16} />}
            onClick={() => setIsEditing(true)}
          >
            Edit Details
          </Button>
        </Group>
      </Stack>
    );
  }

  return (
    <form onSubmit={form.onSubmit((values) => onSave(values))}>
      <Stack gap="md">
        <TextInput
          label="Publication Title"
          placeholder="Enter title"
          {...form.getInputProps("publication_title")}
        />

        <Group grow>
          <Select
            label="Publication Type"
            data={pubType}
            {...form.getInputProps("publication_type")}
          />
          <Select
            label="Author"
            data={authordata}
            {...form.getInputProps("author_id")}
          />
        </Group>

        <DateInput
          label="Publication Date"
          {...form.getInputProps("publication_date")}
        />

        <TextInput label="Content details" {...form.getInputProps("detail")} />

        <Textarea label="References" {...form.getInputProps("ref_detail")} />

        <Group justify="flex-end" mt="xl">
          <Button variant="outline" onClick={() => modals.closeAll()}>
            Cancel
          </Button>
          <Button type="submit" color="blue">
            Save Changes
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
