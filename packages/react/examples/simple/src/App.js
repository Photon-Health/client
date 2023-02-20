import { usePhoton } from "@photonhealth/react";
import {
  Container,
  Flex,
  Text,
  List,
  ListItem,
  Button,
} from "@chakra-ui/react";
import { CheckIcon, CloseIcon } from "@chakra-ui/icons";

const OrgList = ({ user }) => {
  const { getOrganizations, login } = usePhoton();
  const { organizations, loading } = getOrganizations();
  return !loading ? (
    <List>
      {organizations.map((x) => {
        return (
          <ListItem pl="8">
            <Flex gap="4" align="center" maxW="50%" pb="2">
              <Text
                style={user?.org_id === x.id ? { color: "red" } : {}}
                flex="1"
              >
                {x.name}
              </Text>
              {!user?.org_id ? (
                <Button
                  colorScheme="blue"
                  justifySelf="flex-end"
                  onClick={() => login({ organizationId: x.id })}
                >
                  Login
                </Button>
              ) : null}
            </Flex>
          </ListItem>
        );
      })}
    </List>
  ) : null;
};

function App() {
  const { isAuthenticated, login, logout, user, isLoading } =
    usePhoton();

  return !isLoading ? (
    <Flex direction={"column"} justify={"center"}>
      <Container>
        <Text>
          User Authenticated: {isAuthenticated ? <CheckIcon /> : <CloseIcon />}
        </Text>
        {isAuthenticated ? (
        <>
          <Text mb="4">Organization (Red is currently logged in):</Text>
          <OrgList user={user} />
        </>
        ) : null}
        {user ? <><Text>User:</Text><Text pl="8">Name: {user.name}</Text></> : null}
        {!isAuthenticated ? (
          <Button colorScheme="blue" mt="4" onClick={() => login()}>
            Login
          </Button>
        ) : (
          <Button mt="4" onClick={() => logout({})}>
            Logout
          </Button>
        )}
      </Container>
    </Flex>
  ) : (
    <Flex direction={"column"} justify={"center"}>
      <Container centerContent>
        <p>Loading...</p>
      </Container>
    </Flex>
  );
}

export default App;
