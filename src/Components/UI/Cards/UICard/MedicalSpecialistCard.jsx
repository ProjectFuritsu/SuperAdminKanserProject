import {
  Card,
  Avatar,
  Text,
  Group,
  Badge,
  Stack,
  Divider,
  Button,
  Box,
} from "@mantine/core";

export default function MedicalSpecialistCard({ data, onViewDetails }) {
  const specs = data.specialized ? JSON.parse(data.specialized) : [];
  const primaryInsti = data.medical_specialist_health_institution_map?.[0];

  return (
    <Card
      shadow="sm"
      padding="md"
      radius="md"
      withBorder
      h="100%"
      display="flex"
      style={{ flexDirection: "column" }}
    >
      {/* Top Header: Avatar & Status */}
      <Group justify="space-between" mb="xs">
        <Avatar
          src={data.image}
          radius="xl"
          size="md"
          color="blue"
          variant="light"
        >
          {data.name.charAt(0)}
        </Avatar>
        <Badge variant="light" size="xs" color="teal">
          Available Today
        </Badge>
      </Group>

      {/* Doctor Info */}
      <Stack gap={2} mb="md">
        <Text fw={700} size="md" lh={1.2}>
          {data.name}
        </Text>
        <Text size="xs" c="dimmed">
          {data.suffixes || "Medical Specialist"}
        </Text>
      </Stack>

      {/* Expertise: Cleaner Tags instead of Boxes */}
      {/* Inside your Card mapping */}
      <Group gap={5} mb="md">
        {specs.slice(0, 3).map((spec, i) => (
          <Badge key={i} variant="flat" size="xs" color="blue" radius="sm">
            {spec}
          </Badge>
        ))}

        {specs.length > 3 && (
          <Badge variant="dot" size="xs" color="gray" radius="sm">
            +{specs.length - 3} more
          </Badge>
        )}
      </Group>

      <Divider variant="dashed" mb="sm" mt="auto" />

      {/* Location */}
      <Group gap={8} wrap="nowrap" align="center" mb="md">
        <Text size="sm">📍</Text>
        <Box style={{ overflow: "hidden" }}>
          <Text size="xs" fw={700} truncate>
            {primaryInsti?.health_insti?.health_insti_name || "Private Clinic"}
          </Text>
          <Text size="10px" c="dimmed" truncate>
            {primaryInsti?.location || "No address listed"}
          </Text>
        </Box>
      </Group>

      <Button
        fullWidth
        variant="light"
        radius="md"
        size="sm"
        onClick={onViewDetails}
      >
        View Profile
      </Button>
    </Card>
  );
}
