import { Text, Title } from '@mantine/core';


export default function Dashboard() {
    return (
        <>
            <Title order={2}>Dashboard</Title>
            <Text mt="sm">
                Overview, stats, charts, whatever makes sense here.
            </Text>
        </>
    );
}
