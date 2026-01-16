import { Card, Center, ActionIcon, Modal } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconPlus } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import FinancialInstiStepper from '../Stepper/FinancialInstiStepper';
export default function FinancialInstiCardButton({ title, onsuccess }) {
  const [opened, { open, close }] = useDisclosure(false);


  const onsubmitsuccess = async () => {
    if (onsuccess) {
      await notifications.show({
        title: 'Success',
        message: 'Institution added successfully!',
        color: 'green',
        position: 'bottom-right',
        autoClose: 3000,
      })
      await onsuccess();
      await close();
    }
  }

  return (
    <>

      <Modal opened={opened} onClose={close} title={title} centered size={1000} closeOnClickOutside={false} closeOnEscape={false}>
        {/* Stepper component goes here */}
        <FinancialInstiStepper  onSubmitSuccess={onsubmitsuccess}
        />
      </Modal>
      <Card
        onClick={open}
        style={{
          cursor: "pointer",
          borderStyle: "dashed",
          // borderWidth: "1px", // Ensure width is defined
          // ADD THIS: Initial border color
          borderColor: "var(--mantine-color-gray-4)",
          backgroundColor: "transparent",
          transition: "background-color 120ms ease, border-color 120ms ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "var(--mantine-color-blue-0)";
          e.currentTarget.style.borderColor = "var(--mantine-color-blue-5)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "transparent";
          e.currentTarget.style.borderColor = "var(--mantine-color-gray-4)";
        }}
      >

        <Center style={{ height: 200 }}>
          <ActionIcon
            variant="subtle"
            radius="xl"
            size="xl"
            aria-label="Add new"
          >
            <IconPlus size={32} />
          </ActionIcon>
        </Center>
      </Card>
    </>
  )
}
